import type { Eip1193Provider } from '@coti-io/coti-ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAddress } from 'viem';

import { ONBOARD_CONTRACT_ADDRESS } from '../config/onboard';
import { useInvokeSnap } from './useInvokeSnap';
import { useMetaMask } from './useMetaMask';

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
  settingAESKeyError: boolean;
  onboardContractAddress: `0x${string}`;
  handleOnChangeContactAddress: (
    inputEvent: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleCancelOnboard: () => void;
};

const SnapContext = createContext<SnapContextProps | undefined>(undefined);

export const SnapProvider = ({ children }: { children: ReactNode }) => {
  const invokeSnap = useInvokeSnap();
  const { installedSnap } = useMetaMask();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingAESKeyError, setSettingAESKeyError] = useState<boolean>(false);
  const [onboardContractAddress, setOnboardContractAddress] =
    useState<`0x${string}`>(ONBOARD_CONTRACT_ADDRESS);

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
      if (caveat?.value?.length > 0) {
        console.log('eth_accounts address:', caveat.value[0]);
        return true;
      }
    }
    console.log('eth_accounts permission not found or no address available');
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
    setOnboardContractAddress(ONBOARD_CONTRACT_ADDRESS);
    setSettingAESKeyError(false);
  };

  const setAESKey = async () => {
    setLoading(true);

    const hasPermissions = await getWalletPermissions();

    if (!hasPermissions) {
      const connect = await connectSnapToWallet();
      if (!connect) {
        setLoading(false);
        return;
      }
    }

    try {
      if (!isAddress(onboardContractAddress)) {
        setSettingAESKeyError(true);
        setLoading(false);
        return;
      }

      const provider = new BrowserProvider(window.ethereum as Eip1193Provider);

      const signer = await provider.getSigner();

      await signer
        .signMessage(
          'You will be prompted to sign a message to set your AES key.',
        )
        .then(async () => {
          await signer.generateOrRecoverAes(onboardContractAddress);
        });
      const aesKey = signer.getUserOnboardInfo()?.aesKey;

      if (aesKey === null) {
        setLoading(false);
        return;
      }

      console.log('aesKey:', aesKey);

      const result = await invokeSnap({
        method: 'set-aes-key',
        params: {
          newUserAesKey: aesKey,
        },
      });

      if (result) {
        setUserHasAesKEY(true);
      }
    } catch (error) {
      console.error('Error setting AES key:', error);
      setSettingAESKeyError(true);
    } finally {
      setLoading(false);
    }
  };

  const hasAESKey = async () => {
    setLoading(true);
    const result = await invokeSnap({
      method: 'has-aes-key',
    });

    if (result) {
      setUserHasAesKEY(result as boolean);
      return true;
    }

    setLoading(false);
    return false;
  };

  const getAESKey = async () => {
    setLoading(true);
    const result = await invokeSnap({
      method: 'get-aes-key',
    });

    if (result !== null) {
      setUserAesKEY(result as string);
    }
    setLoading(false);
  };

  const deleteAESKey = async () => {
    setLoading(true);
    const result = await invokeSnap({
      method: 'delete-aes-key',
    });

    if (result) {
      setUserHasAesKEY(false);
      setShowDelete(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (installedSnap) {
      hasAESKey().catch((error) => {
        console.error('Error in hasAESKey', error);
      });
    }
  }, [installedSnap]);

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
