import type { Eip1193Provider } from '@coti-io/coti-ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
};

const SnapContext = createContext<SnapContextProps | undefined>(undefined);

export const SnapProvider = ({ children }: { children: ReactNode }) => {
  const invokeSnap = useInvokeSnap();
  const { installedSnap } = useMetaMask();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);
  const [userHasAESKey, setUserHasAesKEY] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleShowDelete = () => {
    setShowDelete(!showDelete);
  };

  const setAESKey = async () => {
    const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
    const signer = await provider.getSigner();
    await signer.generateOrRecoverAes();
    const aesKey = signer.getUserOnboardInfo()?.aesKey;

    if (aesKey === null) {
      return;
    }

    const result = await invokeSnap({
      method: 'set-aes-key',
      params: {
        newUserAesKey: aesKey,
      },
    });

    if (result) {
      setUserHasAesKEY(true);
    }
  };

  const hasAESKey = async () => {
    const result = await invokeSnap({
      method: 'has-aes-key',
    });

    if (result) {
      setUserHasAesKEY(result as boolean);
    }
  };

  const getAESKey = async () => {
    const result = await invokeSnap({
      method: 'get-aes-key',
    });

    if (result !== null) {
      setUserAesKEY(result as string);
    }
  };

  const deleteAESKey = async () => {
    const result = await invokeSnap({
      method: 'delete-aes-key',
    });

    if (result === null) {
      setUserHasAesKEY(false);
      setShowDelete(false);
    }
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
