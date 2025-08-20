import type { Eip1193Provider } from '@coti-io/coti-ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import { USED_ONBOARD_CONTRACT_ADDRESS } from '../config/onboard';
import { useInvokeSnap } from './useInvokeSnap';
import { useMetaMask } from './useMetaMask';
import { useMetaMaskContext } from './MetamaskContext';

export type setAESKeyErrorsType =
  | 'accountBalanceZero'
  | 'invalidAddress'
  | 'userRejected'
  | 'unknownError'
  | null;

export type OnboardingStep = 
  | 'signature-prompt'
  | 'signature-request'
  | 'send-tx'
  | 'done'
  | null;

type SnapContextProps = {
  setAESKey: () => Promise<void>;
  deleteAESKey: () => Promise<void>;
  getAESKey: () => Promise<void>;
  userAESKey: string | null;
  setUserAesKEY: (key: string | null) => void;
  userHasAESKey: boolean;
  handleShowDelete: () => void;
  showDelete: boolean;
  loading: boolean;
  settingAESKeyError: setAESKeyErrorsType;
  onboardContractAddress: `0x${string}`;
  handleOnChangeContactAddress: (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleCancelOnboard: () => void;
  onboardingStep: OnboardingStep;
};

const SnapContext = createContext<SnapContextProps | undefined>(undefined);

export const SnapProvider = ({ children }: { children: ReactNode }) => {
  const invokeSnap = useInvokeSnap();
  const { address } = useAccount();
  const { installedSnap } = useMetaMask();
  const { error: metamaskError } = useMetaMaskContext();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingAESKeyError, setSettingAESKeyError] =
    useState<setAESKeyErrorsType>(null);
  const [onboardContractAddress, setOnboardContractAddress] =
    useState<`0x${string}`>(USED_ONBOARD_CONTRACT_ADDRESS);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWalletPermissions = async () => {
    const permissions: any[] = (await invokeSnap({
      method: 'get-permissions',
    })) as any[];
    let ethAccountsPermission = null;
    if (permissions && permissions.length > 0) {
      ethAccountsPermission = permissions.find(
        (permission: any) => permission.parentCapability === 'eth_accounts',
      );
    }
    if (ethAccountsPermission) {
      const caveat = ethAccountsPermission.caveats?.find(
        (_caveat: any) => _caveat.type === 'restrictReturnedAccounts',
      );
      if (caveat?.value && caveat.value.length > 0) {
        return true;
      }
    }
    return false;
  };

  const connectSnapToWallet = async () => {
    const result = await invokeSnap({
      method: 'connect-to-wallet',
    });

    if (result) {
      return true;
    }
    return false;
  };

  const handleShowDelete = () => {
    setShowDelete(!showDelete);
  };

  const handleOnChangeContactAddress = (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setOnboardContractAddress(inputEvent.target.value as `0x${string}`);
  };

  const handleCancelOnboard = () => {
    setOnboardContractAddress(USED_ONBOARD_CONTRACT_ADDRESS);
    setSettingAESKeyError(null);
    setOnboardingStep(null);
  };

  const setAESKey = async () => {
    setLoading(true);
    setSettingAESKeyError(null);
    setOnboardingStep('signature-prompt');

    const hasPermissions = await getWalletPermissions();

    if (!hasPermissions) {
      const connect = await connectSnapToWallet();
      if (!connect) {
        setLoading(false);
        setOnboardingStep(null);
        return;
      }
    }

    try {
      if (!isAddress(onboardContractAddress)) {
        setSettingAESKeyError('invalidAddress');
        setLoading(false);
        setOnboardingStep(null);
        return;
      }

      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
      const signer = await provider.getSigner();

      setOnboardingStep('signature-request');
      await signer.signMessage(
        'You will be prompted to sign a message to set your AES key. The body of the message will show its encrypted contents.',
      );

      setOnboardingStep('send-tx');
      let retryCount = 0;
      const maxRetries = 3;
      let aesKey = null;

      while (retryCount < maxRetries && aesKey === null) {
        try {
          await signer.generateOrRecoverAes(onboardContractAddress);
          aesKey = signer.getUserOnboardInfo()?.aesKey;
          
          if (aesKey === null) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        } catch (providerError: any) {
          if (
            providerError.message?.includes('Block tracker destroyed') ||
            providerError.message?.includes('connection') ||
            providerError.code === 'UNKNOWN_ERROR'
          ) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
              continue;
            }
          }
          throw providerError;
        }
      }

      if (aesKey === null) {
        setLoading(false);
        setOnboardingStep(null);
        return;
      }

      const result = await invokeSnap({
        method: 'set-aes-key',
        params: {
          newUserAesKey: aesKey,
        },
      });

      if (result) {
        setOnboardingStep('done');
        setUserHasAesKEY(true);
        setSettingAESKeyError(null);
        
        setTimeout(() => {
          setLoading(false);
          setOnboardingStep(null);
        }, 1500);

        return;
      } else {
        console.error('setAESKey failed - snap returned:', result);
        if (metamaskError) {
          console.error('MetaMask error details:', metamaskError.message, metamaskError);
          if (metamaskError.message.includes('User rejected') || (metamaskError as any).code === 4001) {
            setSettingAESKeyError('userRejected');
          } else {
            setSettingAESKeyError('unknownError');
          }
        } else {
          setSettingAESKeyError('unknownError');
        }
        setLoading(false);
        setOnboardingStep(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Account balance is 0')) {
          setSettingAESKeyError('accountBalanceZero');
        } else if (
          error.message.includes('user rejected') || 
          error.message.includes('User rejected') ||
          error.message.includes('ACTION_REJECTED') ||
          error.message.includes('ethers-user-denied') ||
          (error as any).code === 4001
        ) {
          setSettingAESKeyError('userRejected');
        } else {
          console.error('Error setting AES key:', error.message);
          setSettingAESKeyError('unknownError');
        }
      } else {
        setSettingAESKeyError('unknownError');
      }
      
      setLoading(false);
      setOnboardingStep(null);
    }
  };

  const getAESKey = async () => {
    setLoading(true);
    try {
      const result = await invokeSnap({
        method: 'get-aes-key',
      });

      if (result !== null) {
        setUserAesKEY(result as string);
      } else {
        const rejectionError = new Error('User rejected the request');
        (rejectionError as any).code = 4001;
        throw rejectionError;
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAESKey = async () => {
    setLoading(true);
    const result = await invokeSnap({
      method: 'delete-aes-key',
    });

    if (result) {
      setUserHasAesKEY(false);
      setShowDelete(false);
      setSettingAESKeyError(null);
    }
    setLoading(false);
  };

  const syncedRef = useRef(false);
  useEffect(() => {
    const syncEnvironmentWithSnap = async () => {
      if (installedSnap && !syncedRef.current) {
        try {
          syncedRef.current = true;
          const environment = import.meta.env.VITE_NODE_ENV === 'local' ? 'testnet' : 'mainnet';
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
          await invokeSnap({
            method: 'set-environment',
            params: { environment },
          });
          
        } catch (error) {
          syncedRef.current = false;
        }
      }
    };

    if (installedSnap) {
      setTimeout(syncEnvironmentWithSnap, 0);
    }
  }, [installedSnap, invokeSnap]);

  useEffect(() => {
    if (address) {      
      setUserHasAesKEY(false);
      setUserAesKEY(null);
      setSettingAESKeyError(null);
      setOnboardingStep(null);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [address]);

  return (
    <SnapContext.Provider
      value={{
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
      }}
    >
      {children}
    </SnapContext.Provider>
  );
};

export const useSnap = (): SnapContextProps => {
  const context = useContext(SnapContext);
  if (context === undefined) {
    throw new Error('useSnap must be used within a SnapProvider');
  }
  return context;
};
