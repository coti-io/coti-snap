import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useInvokeSnap } from './useInvokeSnap';
import { useMetaMask } from './useMetaMask';

type SnapContextProps = {
  deleteAESKey: () => Promise<void>;
  userAESKey: string | null;
};

const SnapContext = createContext<SnapContextProps | undefined>(undefined);

export const SnapProvider = ({ children }: { children: ReactNode }) => {
  const invokeSnap = useInvokeSnap();
  const { installedSnap } = useMetaMask();

  const [userAESKey, setUserAesKEY] = useState<string | null>(null);

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
      setUserAesKEY(null);
    }
  };

  useEffect(() => {
    if (installedSnap) {
      getAESKey().catch((error) => {
        console.error('Error in getAESKey', error);
      });
    }
  }, [installedSnap]);

  return (
    <SnapContext.Provider value={{ deleteAESKey, userAESKey }}>
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
