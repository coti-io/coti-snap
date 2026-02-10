import type { MetaMaskInpageProvider } from '@metamask/providers';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import type { Snap } from '../types';
import { getSnapsProvider } from '../utils';

type MetaMaskContextType = {
  provider: MetaMaskInpageProvider | null;
  installedSnap: Snap | null;
  error: Error | null;
  isInstallingSnap: boolean;
  hasCheckedForProvider: boolean;
  setInstalledSnap: (snap: Snap | null) => void;
  setError: (error: Error) => void;
  setIsInstallingSnap: (installing: boolean) => void;
};

export const MetaMaskContext = createContext<MetaMaskContextType>({
  provider: null,
  installedSnap: null,
  error: null,
  isInstallingSnap: false,
  hasCheckedForProvider: false,
  setInstalledSnap: () => {
    /* no-op */
  },
  setError: () => {
    /* no-op */
  },
  setIsInstallingSnap: () => {
    /* no-op */
  },
});

/**
 * MetaMask context provider to handle MetaMask and snap status.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX.
 */
export const MetaMaskProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<MetaMaskInpageProvider | null>(null);
  const [installedSnap, setInstalledSnap] = useState<Snap | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInstallingSnap, setIsInstallingSnap] = useState<boolean>(false);
  const [hasCheckedForProvider, setHasCheckedForProvider] =
    useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const detectProvider = async () => {
      try {
        const snapsProvider = await getSnapsProvider();
        if (isMounted) {
          setProvider(snapsProvider);
        }
      } catch (error) {
        void error;
      } finally {
        if (isMounted) {
          setHasCheckedForProvider(true);
        }
      }
    };

    void detectProvider();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 10000);

      return () => {
        clearTimeout(timeout);
      };
    }

    return undefined;
  }, [error]);

  return (
    <MetaMaskContext.Provider
      value={{
        provider,
        error,
        setError,
        installedSnap,
        setInstalledSnap,
        isInstallingSnap,
        setIsInstallingSnap,
        hasCheckedForProvider,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

/**
 * Utility hook to consume the MetaMask context.
 *
 * @returns The MetaMask context.
 */
export function useMetaMaskContext() {
  return useContext(MetaMaskContext);
}
