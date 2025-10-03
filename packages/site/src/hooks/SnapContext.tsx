import type { Eip1193Provider } from '@coti-io/coti-ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { USED_ONBOARD_CONTRACT_ADDRESS } from '../config/onboard';
import { useInvokeSnap } from './useInvokeSnap';
import { useMetaMask } from './useMetaMask';
import { useMetaMaskContext } from './MetamaskContext';
import { hasCompletedOnboarding, setOnboardingCompleted, clearOnboardingCompleted, clearAllOnboardingData } from '../utils/onboardingStorage';

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

interface PermissionCheckResult {
  hasPermission: boolean;
  currentAccount: string | null;
  permittedAccounts: string[];
}

interface EthAccountsPermission {
  parentCapability: string;
  caveats?: Array<{
    type: string;
    value: string[];
  }>;
}

interface SnapContextValue {
  readonly setAESKey: () => Promise<void>;
  readonly deleteAESKey: () => Promise<void>;
  readonly getAESKey: () => Promise<void>;
  readonly userAESKey: string | null;
  readonly setUserAesKEY: (key: string | null) => void;
  readonly userHasAESKey: boolean;
  readonly handleShowDelete: () => void;
  readonly showDelete: boolean;
  readonly loading: boolean;
  readonly settingAESKeyError: SetAESKeyError;
  readonly onboardContractAddress: `0x${string}`;
  readonly handleOnChangeContactAddress: (inputEvent: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleCancelOnboard: () => void;
  readonly onboardingStep: OnboardingStep;
  readonly isInitializing: boolean;
}

interface SnapProviderProps {
  readonly children: ReactNode;
}

const MAX_RETRIES = 3;
const ENVIRONMENT = import.meta.env.VITE_NODE_ENV === 'testnet' ? 'testnet' : 'mainnet';
const SYNC_DELAY = 200;

const isUserRejectedError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as any).code;

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
  const { address } = useAccount();
  const { installedSnap, isInstallingSnap } = useMetaMask();
  const { error: metamaskError, provider } = useMetaMaskContext();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [settingAESKeyError, setSettingAESKeyError] = useState<SetAESKeyError>(null);
  const [onboardContractAddress, setOnboardContractAddress] = useState<`0x${string}`>(USED_ONBOARD_CONTRACT_ADDRESS);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncedRef = useRef<boolean>(false);
  const initialCheckRef = useRef<boolean>(false);
  const lastCheckedAddressRef = useRef<string | null>(null);
  const permissionCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousInstalledSnapRef = useRef<typeof installedSnap>(installedSnap);

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

  const resetOnboardingState = useCallback((): void => {
    setOnboardingStep(null);
    setSettingAESKeyError(null);
    setLoading(false);
  }, []);

  const checkWalletPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permissions = await invokeSnap({ method: 'get-permissions' }) as EthAccountsPermission[];

      if (!Array.isArray(permissions)) {
        return false;
      }

      const ethAccountsPermission = permissions.find(
        permission => permission.parentCapability === 'eth_accounts'
      );

      if (!ethAccountsPermission) return false;

      const caveat = ethAccountsPermission.caveats?.find(
        caveat => caveat.type === 'restrictReturnedAccounts'
      );

      return Boolean(caveat?.value?.length);
    } catch (error) {
      console.error('Failed to check wallet permissions:', error);
      return false;
    }
  }, [invokeSnap]);

  const connectSnapToWallet = useCallback(async (): Promise<boolean> => {
    try {
      const result = await invokeSnap({ method: 'connect-to-wallet' });
      return Boolean(result);
    } catch (error) {
      console.error('Failed to connect snap to wallet:', error);
      return false;
    }
  }, [invokeSnap]);

  const checkAccountPermissions = useCallback(async (targetAccount?: string): Promise<PermissionCheckResult> => {
    if (!address || !installedSnap) {
      return { hasPermission: false, currentAccount: null, permittedAccounts: [] };
    }

    try {
      const result = await invokeSnap({
        method: 'check-account-permissions',
        ...(targetAccount && { params: { targetAccount } })
      }) as PermissionCheckResult;

      if (!result) {
        return { hasPermission: false, currentAccount: null, permittedAccounts: [] };
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('No account connected')) {
        throw error;
      }

      try {
        const permissions = await invokeSnap({ method: 'get-permissions' }) as EthAccountsPermission[];

        if (!Array.isArray(permissions)) {
          return { hasPermission: true, currentAccount: address ?? null, permittedAccounts: [] };
        }

        const ethAccountsPermission = permissions.find(
          permission => permission.parentCapability === 'eth_accounts'
        );

        if (!ethAccountsPermission) {
          return { hasPermission: true, currentAccount: address ?? null, permittedAccounts: [] };
        }

        const caveat = ethAccountsPermission.caveats?.find(
          caveat => caveat.type === 'restrictReturnedAccounts'
        );

        if (!caveat?.value?.length) {
          return { hasPermission: true, currentAccount: address ?? null, permittedAccounts: [] };
        }

        const currentAddress = (targetAccount ?? address)?.toLowerCase();
        const hasPermission = currentAddress ? caveat.value.includes(currentAddress) : false;

        return {
          hasPermission,
          currentAccount: targetAccount ?? address ?? null,
          permittedAccounts: caveat.value
        };
      } catch (fallbackError) {
        console.error('Permission check fallback failed:', fallbackError);
        throw fallbackError;
      }
    }
  }, [invokeSnap, address, installedSnap]);

  const checkPermissionsForAccount = useCallback(async (targetAddress: string): Promise<void> => {
    
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
        if (permissionCheck && permissionCheck.hasPermission === false) {
          setSettingAESKeyError('accountPermissionDenied');
        } else if (permissionCheck && permissionCheck.hasPermission === true) {
          if (settingAESKeyError === 'accountPermissionDenied') {
            setSettingAESKeyError(null);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('No account connected')) {
          return;
        }
        console.warn('Permission check failed for account:', targetAddress, error);
      }
    }, 800);
  }, [installedSnap, checkAccountPermissions, settingAESKeyError]);

  const handleShowDelete = useCallback((): void => {
    setShowDelete(prev => !prev);
  }, []);

  const handleOnChangeContactAddress = useCallback((
    inputEvent: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setOnboardContractAddress(inputEvent.target.value as `0x${string}`);
  }, []);

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

      await new Promise(resolve => setTimeout(resolve, 300));

      setOnboardingStep('signature-request');
      await signer.signMessage(
        'You will be prompted to sign a message to set your AES key. The body of the message will show its encrypted contents.'
      );

      setOnboardingStep('send-tx');
      let aesKey: string | null = null;
      let retryCount = 0;

      while (retryCount < MAX_RETRIES && !aesKey) {
        try {
          await signer.generateOrRecoverAes(onboardContractAddress);
          aesKey = signer.getUserOnboardInfo()?.aesKey ?? null;

          if (!aesKey && retryCount < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, getRetryDelay(retryCount + 1)));
            retryCount++;
          } else if (!aesKey) {
            retryCount++;
          }
        } catch (providerError: any) {
          if (providerError.message?.includes('Account balance is 0') ||
              providerError.message?.includes('balance')) {
            throw providerError;
          }

          const isRetryableError =
            providerError.message?.includes('Block tracker destroyed') ||
            providerError.message?.includes('connection') ||
            providerError.code === 'UNKNOWN_ERROR';

          if (isRetryableError && retryCount < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, getSyncDelay(retryCount + 1)));
            retryCount++;
            continue;
          }
          throw providerError;
        }
      }

      if (!aesKey) {
        console.error('Failed to generate AES key after all retries');
        setSettingAESKeyError('unknownError');
        resetOnboardingState();
        return;
      }

      const result = await invokeSnap({
        method: 'set-aes-key',
        params: { newUserAesKey: aesKey }
      });

      if (result) {
        setOnboardingStep('done');
        setUserHasAesKEY(true);
        setSettingAESKeyError(null);

        if (address) {
          setOnboardingCompleted(address);
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
    resetOnboardingState
  ]);

  const handleSetAESKeyError = useCallback((error?: unknown): void => {
    if (error instanceof Error) {
      if (error.message.includes('Account balance is 0')) {
        setSettingAESKeyError('accountBalanceZero');
      } else if (isUserRejectedError(error)) {
        setSettingAESKeyError('userRejected');
      } else {
        console.error('Error setting AES key:', error.message);
        setSettingAESKeyError('unknownError');
      }
    } else if (metamaskError) {
      console.error('MetaMask error details:', metamaskError.message, metamaskError);
      if (isUserRejectedError(metamaskError)) {
        setSettingAESKeyError('userRejected');
      } else {
        setSettingAESKeyError('unknownError');
      }
    } else {
      setSettingAESKeyError('unknownError');
    }

    resetOnboardingState();
  }, [metamaskError, resetOnboardingState]);

  const getAESKey = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await invokeSnap({ method: 'get-aes-key' });

      if (result !== null) {
        setUserAesKEY(result as string);
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
  }, [invokeSnap]);

  const deleteAESKey = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await invokeSnap({ method: 'delete-aes-key' });

      if (result) {
        setUserHasAesKEY(false);
        setShowDelete(false);
        setSettingAESKeyError(null);

        if (address) {
          clearOnboardingCompleted(address);
        }
      }
    } catch (error) {
      console.error('Failed to delete AES key:', error);
    } finally {
      setLoading(false);
    }
  }, [invokeSnap, address]);

  useEffect(() => {
    const syncEnvironmentWithSnap = async (): Promise<void> => {
      if (!installedSnap || syncedRef.current || !address) return;

      try {
        syncedRef.current = true;
        await new Promise(resolve => setTimeout(resolve, SYNC_DELAY));

        await invokeSnap({
          method: 'set-environment',
          params: { environment: ENVIRONMENT }
        });
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes('No account connected')) {
          console.error('Failed to sync environment:', error);
        }
        syncedRef.current = false;
      }
    };

    if (installedSnap && address && !syncedRef.current) {
      const timer = setTimeout(syncEnvironmentWithSnap, SYNC_DELAY);
      return () => clearTimeout(timer);
    }
  }, [installedSnap, address]);

  const handlePermissionCheck = useCallback(async (): Promise<void> => {
    if (!address || !installedSnap || initialCheckRef.current || isInstallingSnap || loading || onboardingStep !== null) return;

    try {
      const hasOnboarded = hasCompletedOnboarding(address);
      setUserHasAesKEY(hasOnboarded);

      setSettingAESKeyError(null);
      setOnboardingStep(null);
      clearTimerIfExists();

      initialCheckRef.current = true;
      setIsInitializing(false);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('No account connected')) {
        console.error('SnapContext: Permission check failed:', error);
      }
    }
  }, [address, installedSnap, isInstallingSnap, loading, onboardingStep, clearTimerIfExists]);

  useEffect(() => {
    if (loading || onboardingStep !== null) {
      return;
    }

    initialCheckRef.current = false;
    syncedRef.current = false;

    if (!address || !installedSnap) {
      setUserHasAesKEY(false);
      setUserAesKEY(null);
      setSettingAESKeyError(null);
      return;
    }

    if (isInstallingSnap) {
      return;
    }

    const timer = setTimeout(() => {
      void handlePermissionCheck();
    }, 1000);

    return () => clearTimeout(timer);
  }, [address, installedSnap, isInstallingSnap, loading, onboardingStep]);

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
  }, [provider, isInstallingSnap, address, installedSnap]);

  useEffect(() => {
    const previousSnap = previousInstalledSnapRef.current;
    const currentSnap = installedSnap;

    previousInstalledSnapRef.current = currentSnap;

    const snapWasInstalled = previousSnap !== null && previousSnap !== undefined;
    const snapIsNowUninstalled = currentSnap === null;
    const snapWasUninstalled = snapWasInstalled && snapIsNowUninstalled;

    if (snapCheckCompletedRef.current && !isInstallingSnap && snapWasUninstalled) {
      clearAllOnboardingData();
    }
  }, [installedSnap, isInstallingSnap, provider]);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: unknown): Promise<void> => {
      const accountsArray = accounts as string[];

      if (!accountsArray?.length || !installedSnap) {
        setUserHasAesKEY(false);
        setUserAesKEY(null);
        setSettingAESKeyError(null);
        initialCheckRef.current = false;
        lastCheckedAddressRef.current = null;
        return;
      }

      setUserHasAesKEY(false);
      setUserAesKEY(null);
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
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [installedSnap, checkPermissionsForAccount]);

  useEffect(() => {
    if (address && installedSnap) {
      checkPermissionsForAccount(address);
    } else if (!address) {
      setUserHasAesKEY(false);
      setUserAesKEY(null);
      if (settingAESKeyError === 'accountPermissionDenied') {
        setSettingAESKeyError(null);
      }
      lastCheckedAddressRef.current = null;
    }
  }, [address, installedSnap, checkPermissionsForAccount, settingAESKeyError]);

  const contextValue = useMemo((): SnapContextValue => ({
    userHasAESKey,
    setAESKey,
    getAESKey,
    deleteAESKey,
    userAESKey,
    setUserAesKEY,
    handleShowDelete,
    showDelete,
    loading,
    settingAESKeyError,
    onboardContractAddress,
    handleOnChangeContactAddress,
    handleCancelOnboard,
    onboardingStep,
    isInitializing,
  }), [
    userHasAESKey,
    setAESKey,
    getAESKey,
    deleteAESKey,
    userAESKey,
    handleShowDelete,
    showDelete,
    loading,
    settingAESKeyError,
    onboardContractAddress,
    handleOnChangeContactAddress,
    handleCancelOnboard,
    onboardingStep,
    isInitializing,
  ]);

  useEffect(() => {
    return () => {
      clearTimerIfExists();
    };
  }, [clearTimerIfExists]);

  return (
    <SnapContext.Provider value={contextValue}>
      {children}
    </SnapContext.Provider>
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