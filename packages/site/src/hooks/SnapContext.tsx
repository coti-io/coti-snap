import type { Eip1193Provider } from '@coti-io/coti-ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { useMetaMaskContext } from './MetamaskContext';
import { useInvokeSnap } from './useInvokeSnap';
import { useMetaMask } from './useMetaMask';
import { getEnvironmentForChain, isSupportedChainId } from '../config/networks';
import { USED_ONBOARD_CONTRACT_ADDRESS } from '../config/onboard';
import {
  hasCompletedOnboarding,
  setOnboardingCompleted,
  clearOnboardingCompleted,
  clearAllOnboardingData,
} from '../utils/onboardingStorage';

export type SetAESKeyError =
  | 'accountBalanceZero'
  | 'invalidAddress'
  | 'userRejected'
  | 'unknownError'
  | 'accountPermissionDenied'
  | null;

export type OnboardingStep =
  | 'signature-prompt'
  | 'signature-request'
  | 'send-tx'
  | 'done'
  | null;

type PermissionCheckResult = {
  hasPermission: boolean;
  currentAccount: string | null;
  permittedAccounts: string[];
};

type EthAccountsPermission = {
  parentCapability: string;
  caveats?: {
    type: string;
    value: string[];
  }[];
};

type SnapContextValue = {
  readonly setAESKey: () => Promise<void>;
  readonly deleteAESKey: () => Promise<void>;
  readonly getAESKey: () => Promise<void>;
  readonly userAESKey: string | null;
  readonly setUserAesKEY: (
    key: string | null,
    chainIdOverride?: number | null,
  ) => void;
  readonly userHasAESKey: boolean;
  readonly handleShowDelete: () => void;
  readonly showDelete: boolean;
  readonly loading: boolean;
  readonly settingAESKeyError: SetAESKeyError;
  readonly onboardContractAddress: `0x${string}`;
  readonly handleOnChangeContactAddress: (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  readonly handleCancelOnboard: () => void;
  readonly onboardingStep: OnboardingStep;
  readonly isInitializing: boolean;
};

type SnapProviderProps = {
  readonly children: ReactNode;
};

type ResetOnboardingOptions = {
  readonly preserveError?: boolean;
};

const MAX_RETRIES = 3;
const SYNC_DELAY = 200;

const isUserRejectedError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const { code } = error as any;

  return (
    message.includes('user rejected') ||
    message.includes('action_rejected') ||
    message.includes('ethers-user-denied') ||
    code === 4001
  );
};

const getRetryDelay = (attempt: number): number => 1000 * attempt;
const getSyncDelay = (attempt: number): number => 2000 * attempt;

const SnapContext = createContext<SnapContextValue | undefined>(undefined);

export const SnapProvider: React.FC<SnapProviderProps> = ({ children }) => {
  const invokeSnap = useInvokeSnap();
  const { address, chain } = useAccount();
  const { installedSnap, isInstallingSnap } = useMetaMask();
  const {
    error: metamaskError,
    provider,
    hasCheckedForProvider,
  } = useMetaMaskContext();
  const connectedChainId = chain?.id;
  const isChainSupported = isSupportedChainId(connectedChainId);
  const environment = useMemo(
    () =>
      getEnvironmentForChain(isChainSupported ? connectedChainId : undefined),
    [connectedChainId, isChainSupported],
  );
  const [chainIdForStorage, setChainIdForStorage] = useState<number | null>(
    isChainSupported && typeof connectedChainId === 'number'
      ? connectedChainId
      : null,
  );

  const [aesKeysByChain, setAesKeysByChain] = useState<Record<number, string>>(
    {},
  );
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [settingAESKeyError, setSettingAESKeyError] =
    useState<SetAESKeyError>(null);
  const [onboardContractAddress, setOnboardContractAddress] =
    useState<`0x${string}`>(USED_ONBOARD_CONTRACT_ADDRESS);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncedRef = useRef<boolean>(false);
  const initialCheckRef = useRef<boolean>(false);
  const lastCheckedAddressRef = useRef<string | null>(null);
  const permissionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousInstalledSnapRef = useRef<typeof installedSnap>(installedSnap);
  const previousChainIdRef = useRef<number | null>(null);

  const clearTimerIfExists = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (permissionCheckTimeoutRef.current) {
      clearTimeout(permissionCheckTimeoutRef.current);
      permissionCheckTimeoutRef.current = null;
    }
  }, []);

  const resetOnboardingState = useCallback(
    (options: ResetOnboardingOptions = {}): void => {
      setOnboardingStep(null);
      if (!options.preserveError) {
        setSettingAESKeyError(null);
      }
      setLoading(false);
    },
    [],
  );

  const userAESKey = useMemo(() => {
    if (chainIdForStorage === null) {
      return null;
    }
    return aesKeysByChain[chainIdForStorage] ?? null;
  }, [aesKeysByChain, chainIdForStorage]);

  const updateUserAesKey = useCallback(
    (key: string | null, chainIdOverride?: number | null): void => {
      setAesKeysByChain((prev) => {
        const targetChainId = chainIdOverride ?? chainIdForStorage;
        if (targetChainId === null || targetChainId === undefined) {
          return prev;
        }

        if (key === null) {
          if (!(targetChainId in prev)) {
            return prev;
          }
          const { [targetChainId]: _removed, ...rest } = prev;
          return rest;
        }

        if (prev[targetChainId] === key) {
          return prev;
        }
        return {
          ...prev,
          [targetChainId]: key,
        };
      });
    },
    [chainIdForStorage],
  );

  useEffect(() => {
    const normalizedChainId =
      typeof connectedChainId === 'number' ? connectedChainId : null;
    const isValidChainId =
      normalizedChainId !== null && isSupportedChainId(normalizedChainId);
    const previousChainId = previousChainIdRef.current;

    console.log(
      '[FRONTEND] Network change effect - connectedChainId:',
      connectedChainId,
      'previousChainId:',
      previousChainId,
      'normalizedChainId:',
      normalizedChainId,
    );

    if (!isValidChainId) {
      if (previousChainId !== null) {
        console.log('[FRONTEND] Invalid chain - clearing state');
        setUserHasAesKEY(false);
        setAesKeysByChain({});
        setSettingAESKeyError(null);
        resetOnboardingState();
        clearTimerIfExists();
        syncedRef.current = false;
        initialCheckRef.current = false;
        lastCheckedAddressRef.current = null;
      }
      // Don't set isInitializing to true for unsupported chains - there's nothing to initialize
      // The user is on a wrong chain, so we just need to show the network switch UI
      setIsInitializing(false);
      previousChainIdRef.current = null;
      if (chainIdForStorage !== null) {
        setChainIdForStorage(null);
      }
      return;
    }

    if (previousChainId !== null && previousChainId !== normalizedChainId) {
      console.log(
        '[FRONTEND] Chain changed from',
        previousChainId,
        'to',
        normalizedChainId,
        '- clearing state',
      );
      setUserHasAesKEY(false);
      setAesKeysByChain({});
      setSettingAESKeyError(null);
      resetOnboardingState();
      clearTimerIfExists();
      syncedRef.current = false;
      initialCheckRef.current = false;
      lastCheckedAddressRef.current = null;
      setIsInitializing(true);
    }

    previousChainIdRef.current = normalizedChainId;
    setChainIdForStorage((current) =>
      current === normalizedChainId ? current : normalizedChainId,
    );
  }, [
    connectedChainId,
    chainIdForStorage,
    clearTimerIfExists,
    resetOnboardingState,
  ]);

  useEffect(() => {
    if (hasCheckedForProvider && provider === null && !isInstallingSnap) {
      setIsInitializing(false);
    }
  }, [hasCheckedForProvider, provider, isInstallingSnap]);

  const checkWalletPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permissions = (await invokeSnap({
        method: 'get-permissions',
      })) as EthAccountsPermission[];

      if (!Array.isArray(permissions)) {
        return false;
      }

      const ethAccountsPermission = permissions.find(
        (permission) => permission.parentCapability === 'eth_accounts',
      );

      if (!ethAccountsPermission) {
        return false;
      }

      const caveat = ethAccountsPermission.caveats?.find(
        (caveat) => caveat.type === 'restrictReturnedAccounts',
      );

      return Boolean(caveat?.value?.length);
    } catch (error) {
      void error;
      return false;
    }
  }, [invokeSnap, updateUserAesKey]);

  const connectSnapToWallet = useCallback(async (): Promise<boolean> => {
    try {
      const result = await invokeSnap({ method: 'connect-to-wallet' });
      return Boolean(result);
    } catch (error) {
      void error;
      return false;
    }
  }, [invokeSnap]);

  const checkAccountPermissions = useCallback(
    async (targetAccount?: string): Promise<PermissionCheckResult> => {
      if (!address || !installedSnap) {
        return {
          hasPermission: false,
          currentAccount: null,
          permittedAccounts: [],
        };
      }

      try {
        const result = (await invokeSnap({
          method: 'check-account-permissions',
          ...(targetAccount && { params: { targetAccount } }),
        })) as PermissionCheckResult;

        if (!result) {
          return {
            hasPermission: false,
            currentAccount: null,
            permittedAccounts: [],
          };
        }

        return result;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('No account connected')
        ) {
          throw error;
        }

        try {
          const permissions = (await invokeSnap({
            method: 'get-permissions',
          })) as EthAccountsPermission[];

          if (!Array.isArray(permissions)) {
            return {
              hasPermission: true,
              currentAccount: address ?? null,
              permittedAccounts: [],
            };
          }

          const ethAccountsPermission = permissions.find(
            (permission) => permission.parentCapability === 'eth_accounts',
          );

          if (!ethAccountsPermission) {
            return {
              hasPermission: true,
              currentAccount: address ?? null,
              permittedAccounts: [],
            };
          }

          const caveat = ethAccountsPermission.caveats?.find(
            (caveat) => caveat.type === 'restrictReturnedAccounts',
          );

          if (!caveat?.value?.length) {
            return {
              hasPermission: true,
              currentAccount: address ?? null,
              permittedAccounts: [],
            };
          }

          const currentAddress = (targetAccount ?? address)?.toLowerCase();
          const hasPermission = currentAddress
            ? caveat.value.includes(currentAddress)
            : false;

          return {
            hasPermission,
            currentAccount: targetAccount ?? address ?? null,
            permittedAccounts: caveat.value,
          };
        } catch (fallbackError) {
          void fallbackError;
          throw fallbackError;
        }
      }
    },
    [invokeSnap, address, installedSnap],
  );

  const checkPermissionsForAccount = useCallback(
    async (targetAddress: string): Promise<void> => {
      if (permissionCheckTimeoutRef.current) {
        clearTimeout(permissionCheckTimeoutRef.current);
      }
      if (!installedSnap || !targetAddress) {
        return;
      }
      if (lastCheckedAddressRef.current === targetAddress.toLowerCase()) {
        return;
      }
      lastCheckedAddressRef.current = targetAddress.toLowerCase();
      permissionCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const permissionCheck = await checkAccountPermissions(targetAddress);
          if (permissionCheck && !permissionCheck.hasPermission) {
            setSettingAESKeyError('accountPermissionDenied');
          } else if (permissionCheck && permissionCheck.hasPermission) {
            if (settingAESKeyError === 'accountPermissionDenied') {
              setSettingAESKeyError(null);
            }
          }
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('No account connected')
          ) {
            return;
          }
          void error;
        }
      }, 800);
    },
    [installedSnap, checkAccountPermissions, settingAESKeyError],
  );

  const handleShowDelete = useCallback((): void => {
    setShowDelete((prev) => !prev);
  }, []);

  const handleOnChangeContactAddress = useCallback(
    (inputEvent: React.ChangeEvent<HTMLInputElement>): void => {
      setOnboardContractAddress(inputEvent.target.value as `0x${string}`);
    },
    [],
  );

  const handleCancelOnboard = useCallback((): void => {
    setOnboardContractAddress(USED_ONBOARD_CONTRACT_ADDRESS);
    resetOnboardingState();
  }, [resetOnboardingState]);

  const setAESKey = useCallback(async (): Promise<void> => {
    setSettingAESKeyError(null);

    try {
      const permissionCheck = await checkAccountPermissions();

      if (permissionCheck && !permissionCheck.hasPermission) {
        setSettingAESKeyError('accountPermissionDenied');
        return;
      }

      const hasPermissions = await checkWalletPermissions();
      if (!hasPermissions) {
        const connected = await connectSnapToWallet();
        if (!connected) {
          return;
        }
      }

      if (!isAddress(onboardContractAddress)) {
        setSettingAESKeyError('invalidAddress');
        return;
      }

      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();

      const balance = await provider.getBalance(address as string);
      const minBalance = BigInt('5000000000000000');

      if (balance < minBalance) {
        setSettingAESKeyError('accountBalanceZero');
        return;
      }

      setLoading(true);
      setOnboardingStep('signature-prompt');

      await new Promise((resolve) => setTimeout(resolve, 300));

      setOnboardingStep('signature-request');
      await signer.signMessage(
        'You will be prompted to sign a message to set your AES key. The body of the message will show its encrypted contents.',
      );

      setOnboardingStep('send-tx');
      let aesKey: string | null = null;
      let retryCount = 0;

      while (retryCount < MAX_RETRIES && !aesKey) {
        try {
          await signer.generateOrRecoverAes(onboardContractAddress);
          aesKey = signer.getUserOnboardInfo()?.aesKey ?? null;

          if (!aesKey && retryCount < MAX_RETRIES - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, getRetryDelay(retryCount + 1)),
            );
            retryCount++;
          } else if (!aesKey) {
            retryCount++;
          }
        } catch (providerError: any) {
          if (
            providerError.message?.includes('Account balance is 0') ||
            providerError.message?.includes('balance')
          ) {
            throw providerError;
          }

          const isRetryableError =
            providerError.message?.includes('Block tracker destroyed') ||
            providerError.message?.includes('connection') ||
            providerError.code === 'UNKNOWN_ERROR';

          if (isRetryableError && retryCount < MAX_RETRIES - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, getSyncDelay(retryCount + 1)),
            );
            retryCount++;
            continue;
          }
          throw providerError;
        }
      }

      if (!aesKey) {
        setSettingAESKeyError('unknownError');
        resetOnboardingState();
        return;
      }

      console.log(
        '[FRONTEND] setAESKey - saving with chainId:',
        chainIdForStorage,
      );
      const result = await invokeSnap({
        method: 'set-aes-key',
        params: {
          newUserAesKey: aesKey,
          chainId: chainIdForStorage?.toString(),
        },
      });

      if (result) {
        setOnboardingStep('done');
        setUserHasAesKEY(true);
        setSettingAESKeyError(null);
        updateUserAesKey(aesKey);

        if (address) {
          setOnboardingCompleted(address, chainIdForStorage);
        }

        setTimeout(() => {
          resetOnboardingState();
        }, 1500);
      } else {
        handleSetAESKeyError();
      }
    } catch (error) {
      handleSetAESKeyError(error);
    }
  }, [
    checkAccountPermissions,
    checkWalletPermissions,
    connectSnapToWallet,
    onboardContractAddress,
    invokeSnap,
    address,
    resetOnboardingState,
    chainIdForStorage,
    updateUserAesKey,
  ]);

  const handleSetAESKeyError = useCallback(
    (error?: unknown): void => {
      let preserveError = false;

      if (error instanceof Error) {
        if (error.message.includes('Account balance is 0')) {
          setSettingAESKeyError('accountBalanceZero');
          preserveError = true;
        } else if (isUserRejectedError(error)) {
          setSettingAESKeyError('userRejected');
        } else {
          void error;
          setSettingAESKeyError('unknownError');
        }
      } else if (metamaskError) {
        void metamaskError;
        if (isUserRejectedError(metamaskError)) {
          setSettingAESKeyError('userRejected');
        } else {
          setSettingAESKeyError('unknownError');
        }
      } else {
        setSettingAESKeyError('unknownError');
      }

      resetOnboardingState({ preserveError });
    },
    [metamaskError, resetOnboardingState],
  );

  const getAESKey = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      console.log(
        '[FRONTEND] getAESKey - chainIdForStorage:',
        chainIdForStorage,
      );
      const result = await invokeSnap({
        method: 'get-aes-key',
        params: { chainId: chainIdForStorage?.toString() },
      });
      console.log('[FRONTEND] getAESKey - result received');

      if (result !== null) {
        updateUserAesKey(result as string);
        setUserHasAesKEY(true);
      } else {
        const rejectionError = new Error('User rejected the request');
        (rejectionError as any).code = 4001;
        throw rejectionError;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap, updateUserAesKey, chainIdForStorage]);

  const deleteAESKey = useCallback(async (): Promise<void> => {
    if (chainIdForStorage === null) {
      return;
    }

    setLoading(true);
    try {
      console.log(
        '[FRONTEND] deleteAESKey - deleting for chainId:',
        chainIdForStorage,
      );
      const result = await invokeSnap({
        method: 'delete-aes-key',
        params: { chainId: chainIdForStorage?.toString() },
      });

      if (result) {
        setUserHasAesKEY(false);
        setShowDelete(false);
        setSettingAESKeyError(null);
        updateUserAesKey(null);

        if (address) {
          clearOnboardingCompleted(address, chainIdForStorage);
        }
      }
    } catch (error) {
      void error;
    } finally {
      setLoading(false);
    }
  }, [invokeSnap, address, chainIdForStorage, updateUserAesKey]);

  const lastSyncedEnvironmentRef = useRef<string | null>(null);

  useEffect(() => {
    const syncEnvironmentWithSnap = async (): Promise<void> => {
      if (!installedSnap || !address || !isChainSupported) {
        return;
      }

      if (lastSyncedEnvironmentRef.current === environment) {
        return;
      }

      try {
        await invokeSnap({
          method: 'set-environment',
          params: { environment },
        });
        lastSyncedEnvironmentRef.current = environment;
        syncedRef.current = true;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.includes('No account connected')
        ) {
        }
        syncedRef.current = false;
      }
    };

    if (installedSnap && address && isChainSupported) {
      const timer = setTimeout(syncEnvironmentWithSnap, SYNC_DELAY);
      return () => clearTimeout(timer);
    }
  }, [installedSnap, address, environment, isChainSupported, invokeSnap]);

  const checkSnapHasAESKey = useCallback(async (): Promise<boolean> => {
    try {
      console.log(
        '[FRONTEND] checkSnapHasAESKey - chainIdForStorage:',
        chainIdForStorage,
      );
      const result = await invokeSnap({
        method: 'has-aes-key',
        params: { chainId: chainIdForStorage?.toString() },
      });
      console.log('[FRONTEND] checkSnapHasAESKey - result:', result);
      return Boolean(result);
    } catch (error) {
      void error;
      return false;
    }
  }, [invokeSnap, chainIdForStorage]);

  const getAESKeyFromSnap = useCallback(async (): Promise<string | null> => {
    try {
      const result = await invokeSnap({
        method: 'get-aes-key',
        params: { chainId: chainIdForStorage?.toString() },
      });
      return result as string | null;
    } catch (error) {
      void error;
      return null;
    }
  }, [invokeSnap, chainIdForStorage]);

  const syncAesKeyAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    const maybeSyncAesKey = async (): Promise<void> => {
      if (!installedSnap || !userAESKey || chainIdForStorage === null) {
        return;
      }

      const syncKey = `${chainIdForStorage}:${userAESKey}`;
      if (syncAesKeyAttemptRef.current === syncKey) {
        return;
      }
      syncAesKeyAttemptRef.current = syncKey;

      try {
        const hasKey = await checkSnapHasAESKey();
        if (hasKey) {
          return;
        }

        try {
          await connectSnapToWallet();
        } catch (error) {
          void error;
        }

        await invokeSnap({
          method: 'set-aes-key',
          params: {
            newUserAesKey: userAESKey,
            chainId: chainIdForStorage.toString(),
          },
        });
        setUserHasAesKEY(true);
      } catch (error) {
        void error;
      }
    };

    void maybeSyncAesKey();
  }, [
    installedSnap,
    userAESKey,
    chainIdForStorage,
    checkSnapHasAESKey,
    connectSnapToWallet,
    invokeSnap,
  ]);

  const handlePermissionCheck = useCallback(async (): Promise<void> => {
    if (
      !address ||
      !installedSnap ||
      chainIdForStorage === null ||
      initialCheckRef.current ||
      isInstallingSnap ||
      loading ||
      onboardingStep !== null
    ) {
      return;
    }

    try {
      // First, check if the snap already has the AES key stored (no user prompt)
      const snapHasKey = await checkSnapHasAESKey();
      console.log(
        '[FRONTEND] handlePermissionCheck - snapHasKey:',
        snapHasKey,
        'for chainId:',
        chainIdForStorage,
      );

      if (snapHasKey) {
        // Snap has the key - mark user as having AES key
        // We don't retrieve it yet to avoid showing confirmation popup
        // The key will be retrieved only when needed (e.g., for transactions)
        setUserHasAesKEY(true);

        // Also update localStorage for consistency
        if (address) {
          setOnboardingCompleted(address, chainIdForStorage);
        }
      } else {
        // Snap is the source of truth - if snap says no key, then no key
        // Don't use localStorage as it may have incorrect/legacy data
        setUserHasAesKEY(false);

        // Clear localStorage for this chain to keep it consistent with snap
        if (address) {
          clearOnboardingCompleted(address, chainIdForStorage);
        }
      }

      setSettingAESKeyError((prev) =>
        prev === 'accountBalanceZero' ? prev : null,
      );
      setOnboardingStep(null);
      clearTimerIfExists();

      initialCheckRef.current = true;
      setIsInitializing(false);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes('No account connected')
      ) {
        void error;
      }
      // On error, fall back to localStorage (only as fallback for communication errors)
      const hasOnboarded = hasCompletedOnboarding(address, chainIdForStorage);
      setUserHasAesKEY(hasOnboarded);
      initialCheckRef.current = true;
      setIsInitializing(false);
    }
  }, [
    address,
    installedSnap,
    chainIdForStorage,
    isInstallingSnap,
    loading,
    onboardingStep,
    clearTimerIfExists,
    checkSnapHasAESKey,
  ]);

  useEffect(() => {
    if (loading || onboardingStep !== null) {
      return;
    }

    // No resetear initialCheckRef aquí - el efecto de cambio de red ya lo maneja
    // Solo resetear syncedRef para re-sincronizar el environment
    syncedRef.current = false;

    if (!address || !installedSnap) {
      setUserHasAesKEY(false);
      setAesKeysByChain((prev) => (Object.keys(prev).length > 0 ? {} : prev));
      setSettingAESKeyError(null);
      initialCheckRef.current = false;
      return;
    }

    if (isInstallingSnap) {
      return;
    }

    // Solo ejecutar el check si no se ha hecho ya
    if (initialCheckRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      void handlePermissionCheck();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    address,
    installedSnap,
    isInstallingSnap,
    loading,
    onboardingStep,
    environment,
    isChainSupported,
    chainIdForStorage,
  ]);

  const snapCheckCompletedRef = useRef(false);

  useEffect(() => {
    if (provider !== null && !isInstallingSnap) {
      const timer = setTimeout(() => {
        snapCheckCompletedRef.current = true;

        if (!address || installedSnap === null) {
          setIsInitializing(false);
        } else if (initialCheckRef.current) {
          setIsInitializing(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [provider, isInstallingSnap, address, installedSnap, chainIdForStorage]);

  // Fallback: ensure isInitializing is set to false after network switch completes
  // This handles the race condition where handlePermissionCheck might miss due to chainIdForStorage timing
  useEffect(() => {
    if (!isInitializing) {
      return;
    }

    // Only apply fallback when we have all the prerequisites
    if (
      !address ||
      !installedSnap ||
      chainIdForStorage === null ||
      isInstallingSnap
    ) {
      return;
    }

    // Give handlePermissionCheck time to complete (it has a 1s delay + execution time)
    // If isInitializing is still true after 3 seconds, force it to false and trigger check
    const fallbackTimer = setTimeout(() => {
      if (isInitializing && !initialCheckRef.current) {
        console.log(
          '[FRONTEND] Fallback: forcing permission check after network switch',
        );
        void handlePermissionCheck();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [
    isInitializing,
    address,
    installedSnap,
    chainIdForStorage,
    isInstallingSnap,
    handlePermissionCheck,
  ]);

  useEffect(() => {
    const previousSnap = previousInstalledSnapRef.current;
    const currentSnap = installedSnap;

    previousInstalledSnapRef.current = currentSnap;

    const snapWasInstalled =
      previousSnap !== null && previousSnap !== undefined;
    const snapIsNowUninstalled = currentSnap === null;
    const snapWasUninstalled = snapWasInstalled && snapIsNowUninstalled;

    if (
      snapCheckCompletedRef.current &&
      !isInstallingSnap &&
      snapWasUninstalled
    ) {
      clearAllOnboardingData();
      setAesKeysByChain({});
    }
  }, [installedSnap, isInstallingSnap, provider, setAesKeysByChain]);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: unknown): Promise<void> => {
      const accountsArray = accounts as string[];

      if (!accountsArray?.length || !installedSnap) {
        setUserHasAesKEY(false);
        setAesKeysByChain({});
        setSettingAESKeyError(null);
        initialCheckRef.current = false;
        lastCheckedAddressRef.current = null;
        return;
      }

      setUserHasAesKEY(false);
      setAesKeysByChain({});
      setSettingAESKeyError(null);
      initialCheckRef.current = false;

      const newAddress = accountsArray[0];
      if (newAddress) {
        await checkPermissionsForAccount(newAddress);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged,
        );
      };
    }
  }, [installedSnap, checkPermissionsForAccount]);

  useEffect(() => {
    const handleChainChanged = async (chainIdHex: unknown): Promise<void> => {
      if (!installedSnap || !address) {
        return;
      }

      const chainIdNum =
        typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : null;

      if (!chainIdNum || !isSupportedChainId(chainIdNum)) {
        console.log('[FRONTEND] chainChanged - unsupported chain:', chainIdNum);
        return;
      }

      const newEnvironment = getEnvironmentForChain(chainIdNum);
      console.log(
        '[FRONTEND] chainChanged - detected chain:',
        chainIdNum,
        'environment:',
        newEnvironment,
      );

      try {
        await invokeSnap({
          method: 'set-environment',
          params: { environment: newEnvironment },
        });
        lastSyncedEnvironmentRef.current = newEnvironment;
      } catch (error) {
        void error;
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [installedSnap, address, invokeSnap]);

  useEffect(() => {
    if (address && installedSnap) {
      checkPermissionsForAccount(address);
    } else if (!address) {
      setUserHasAesKEY(false);
      setAesKeysByChain((prev) => (Object.keys(prev).length > 0 ? {} : prev));
      if (settingAESKeyError === 'accountPermissionDenied') {
        setSettingAESKeyError(null);
      }
      lastCheckedAddressRef.current = null;
    }
  }, [address, installedSnap, checkPermissionsForAccount, settingAESKeyError]);

  const contextValue = useMemo(
    (): SnapContextValue => ({
      userHasAESKey,
      setAESKey,
      getAESKey,
      deleteAESKey,
      userAESKey,
      setUserAesKEY: updateUserAesKey,
      handleShowDelete,
      showDelete,
      loading,
      settingAESKeyError,
      onboardContractAddress,
      handleOnChangeContactAddress,
      handleCancelOnboard,
      onboardingStep,
      isInitializing,
    }),
    [
      userHasAESKey,
      setAESKey,
      getAESKey,
      deleteAESKey,
      userAESKey,
      updateUserAesKey,
      handleShowDelete,
      showDelete,
      loading,
      settingAESKeyError,
      onboardContractAddress,
      handleOnChangeContactAddress,
      handleCancelOnboard,
      onboardingStep,
      isInitializing,
    ],
  );

  useEffect(() => {
    return () => {
      clearTimerIfExists();
    };
  }, [clearTimerIfExists]);

  return (
    <SnapContext.Provider value={contextValue}>{children}</SnapContext.Provider>
  );
};

export const useSnap = (): SnapContextValue => {
  const context = useContext(SnapContext);
  if (context === undefined) {
    throw new Error('useSnap must be used within a SnapProvider');
  }
  return context;
};

SnapProvider.displayName = 'SnapProvider';
