import { useEffect, useState } from 'react';

import { defaultSnapOrigin } from '../config';
import type { GetSnapsResponse } from '../types';
import { useMetaMaskContext } from './MetamaskContext';
import { useRequest } from './useRequest';

/**
 * A Hook to retrieve useful data from MetaMask.
 * @returns The informations.
 */
export const useMetaMask = () => {
  const { provider, setInstalledSnap, installedSnap, isInstallingSnap, hasCheckedForProvider } = useMetaMaskContext();
  const request = useRequest();

  const [isFlask, setIsFlask] = useState(false);

  const basicMetaMaskDetection = typeof window !== 'undefined' && 
    typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  
  const snapsDetected = provider !== null || basicMetaMaskDetection;

  /**
   * Detect if the version of MetaMask is Flask.
   */
  const detectFlask = async () => {
    const clientVersion = await request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    setIsFlask(isFlaskDetected);
  };

  /**
   * Get the Snap informations from MetaMask.
   */
  const getSnap = async () => {
    const snaps = (await request({
      method: 'wallet_getSnaps',
    })) as GetSnapsResponse;

    setInstalledSnap(snaps[defaultSnapOrigin] ?? null);
  };

  useEffect(() => {
    const detect = async () => {
      if (provider) {
        await detectFlask();
        await getSnap();
      }
    };

    detect().catch(error => {
      void error;
    });
  }, [provider]);

  useEffect(() => {
    if (!provider) return;

    const handleSnapUpdate = () => {
      getSnap().catch(error => {
        void error;
      });
    };

    const interval = setInterval(handleSnapUpdate, 3000);

    window.addEventListener('focus', handleSnapUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleSnapUpdate);
    };
  }, [provider]);

  return { 
    isFlask, 
    snapsDetected, 
    installedSnap, 
    getSnap, 
    isInstallingSnap,
    hasCheckedForProvider
  };
};
