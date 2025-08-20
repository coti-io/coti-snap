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
import { hasCompletedOnboarding, setOnboardingCompleted, clearOnboardingCompleted } from '../utils/onboardingStorage';

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
}

interface SnapProviderProps {
  readonly children: ReactNode;
}

const MAX_RETRIES = 3;
const ENVIRONMENT = import.meta.env.VITE_NODE_ENV === 'local' ? 'testnet' : 'mainnet';
const SYNC_DELAY = 200;
const PERMISSION_CHECK_DELAY = 1000;

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
  const { installedSnap } = useMetaMask();
  const { error: metamaskError } = useMetaMaskContext();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [settingAESKeyError, setSettingAESKeyError] = useState<SetAESKeyError>(null);
  const [onboardContractAddress, setOnboardContractAddress] = useState<`0x${string}`>(USED_ONBOARD_CONTRACT_ADDRESS);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncedRef = useRef<boolean>(false);
  const initialCheckRef = useRef<boolean>(false);

  const clearTimerIfExists = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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
      
      const ethAccountsPermission = permissions?.find(
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
    try {
      const result = await invokeSnap({
        method: 'check-account-permissions',
        ...(targetAccount && { params: { targetAccount } })
      }) as PermissionCheckResult;

      return result;
    } catch (error) {
      try {
        const permissions = await invokeSnap({ method: 'get-permissions' }) as EthAccountsPermission[];
        
        const ethAccountsPermission = permissions?.find(
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
        return { hasPermission: false, currentAccount: null, permittedAccounts: [] };
      }
    }
  }, [invokeSnap, address]);

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
    setLoading(true);
    setSettingAESKeyError(null);
    setOnboardingStep('signature-prompt');

    try {
      const permissionCheck = await checkAccountPermissions();
      
      if (!permissionCheck.hasPermission) {
        setSettingAESKeyError('accountPermissionDenied');
        resetOnboardingState();
        return;
      }

      const hasPermissions = await checkWalletPermissions();
      if (!hasPermissions) {
        const connected = await connectSnapToWallet();
        if (!connected) {
          resetOnboardingState();
          return;
        }
      }

      if (!isAddress(onboardContractAddress)) {
        setSettingAESKeyError('invalidAddress');
        resetOnboardingState();
        return;
      }

      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();

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
          }
        } catch (providerError: any) {
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
      if (!installedSnap || syncedRef.current) return;

      try {
        syncedRef.current = true;
        await new Promise(resolve => setTimeout(resolve, SYNC_DELAY));
        
        await invokeSnap({
          method: 'set-environment',
          params: { environment: ENVIRONMENT }
        });
      } catch (error) {
        console.error('Failed to sync environment:', error);
        syncedRef.current = false;
      }
    };

    if (installedSnap) {
      setTimeout(syncEnvironmentWithSnap, 0);
    }
  }, [installedSnap, invokeSnap]);

  const handlePermissionCheck = useCallback(async (): Promise<void> => {
    if (!address || !installedSnap) return;

    const hasOnboarded = hasCompletedOnboarding(address);
    setUserHasAesKEY(hasOnboarded);
    setUserAesKEY(null);
    setSettingAESKeyError(null);
    setOnboardingStep(null);
    
    clearTimerIfExists();

    try {
      const permissionCheck = await checkAccountPermissions();
      
      if (!permissionCheck.hasPermission) {
        setSettingAESKeyError('accountPermissionDenied');
      } else if (settingAESKeyError === 'accountPermissionDenied') {
        setSettingAESKeyError(null);
      }
    } catch (error) {
      console.error('SnapContext: Permission check failed:', error);
    }
    
    initialCheckRef.current = true;
  }, [address, installedSnap, checkAccountPermissions, settingAESKeyError, clearTimerIfExists]);

  useEffect(() => {
    void handlePermissionCheck();
  }, [handlePermissionCheck]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address && installedSnap && !initialCheckRef.current) {
        try {
          const permissionCheck = await checkAccountPermissions();
          
          if (!permissionCheck.hasPermission) {
            setSettingAESKeyError('accountPermissionDenied');
          }
        } catch (error) {
          console.error('SnapContext: Delayed permission check failed:', error);
        }
        initialCheckRef.current = true;
      }
    }, PERMISSION_CHECK_DELAY);

    return () => clearTimeout(timer);
  }, [checkAccountPermissions]); 

  useEffect(() => {
    const handleAccountsChanged = async (accounts: unknown): Promise<void> => {
      const accountsArray = accounts as string[];
      
      if (!accountsArray?.length || !installedSnap) return;

      const newAddress = accountsArray[0];
      
      try {
        const permissionCheck = await checkAccountPermissions(newAddress);
        
        if (!permissionCheck.hasPermission) {
          setSettingAESKeyError('accountPermissionDenied');
        } else if (settingAESKeyError === 'accountPermissionDenied') {
          setSettingAESKeyError(null);
        }
      } catch (error) {
        console.error('Permission check failed for new account:', error);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [installedSnap, settingAESKeyError, checkAccountPermissions]);

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
  ]);

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