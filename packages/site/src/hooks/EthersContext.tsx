import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';

type EthersContextProps = {
  handleConnect: () => void;
  provider: MetaMaskInpageProvider | null;
};

const EthersContext = createContext<EthersContextProps | undefined>(undefined);

export const EthersProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(null);

  const handleConnect = () => {
    if (provider) {
      provider
        .request({ method: 'eth_requestAccounts' })
        .then((res) => console.log(res))
        .catch((error) => {
          console.error('Failed to request accounts:', error);
        });
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      console.log('window.ethereum >>>>', window.ethereum);
      setProvider(window.ethereum);
    }
  }, []);

  return (
    <EthersContext.Provider value={{ provider, handleConnect }}>
      {children}
    </EthersContext.Provider>
  );
};

export const useEthers = (): EthersContextProps => {
  const context = useContext(EthersContext);
  if (!context) {
    throw new Error('useEthers must be used within an EthersProvider');
  }
  return context;
};
