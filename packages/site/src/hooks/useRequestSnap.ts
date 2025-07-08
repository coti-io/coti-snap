import { defaultSnapOrigin } from '../config';
import type { Snap } from '../types';
import { useMetaMaskContext } from './MetamaskContext';
import { useRequest } from './useRequest';

/**
 * Utility hook to wrap the `wallet_requestSnaps` method.
 *
 * @param snapId - The requested Snap ID. Defaults to the snap ID specified in the
 * config.
 * @param version - The requested version.
 * @returns The `wallet_requestSnaps` wrapper.
 */
export const useRequestSnap = (
  snapId = defaultSnapOrigin,
  version?: string,
) => {
  const request = useRequest();
  const { setInstalledSnap } = useMetaMaskContext();

  /**
   * Request the Snap.
   */
  const requestSnap = async () => {
    try {
      console.log('Requesting snap with ID:', snapId);
      
      const snaps = (await request({
        method: 'wallet_requestSnaps',
        params: {
          [snapId]: version ? { version } : {},
        },
      })) as Record<string, Snap>;

      console.log('Response from wallet_requestSnaps:', snaps);
      console.log('Installed snap:', snaps?.[snapId]);

      // Updates the `installedSnap` context variable since we just installed the Snap.
      setInstalledSnap(snaps?.[snapId] ?? null);
      
      return snaps?.[snapId];
    } catch (error) {
      console.error('Error installing snap:', error);
      throw error;
    }
  };

  return requestSnap;
};
