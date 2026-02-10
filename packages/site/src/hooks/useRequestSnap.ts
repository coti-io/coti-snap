import { useMetaMaskContext } from './MetamaskContext';
import { useRequest } from './useRequest';
import { defaultSnapOrigin } from '../config';
import type { Snap } from '../types';

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
  const { setInstalledSnap, setIsInstallingSnap } = useMetaMaskContext();

  /**
   * Request the Snap.
   */
  const requestSnap = async () => {
    try {
      setIsInstallingSnap(true);

      const snaps = (await request({
        method: 'wallet_requestSnaps',
        params: {
          [snapId]: version ? { version } : {},
        },
      })) as Record<string, Snap>;

      // Updates the `installedSnap` context variable since we just installed the Snap.
      const installedSnap = snaps?.[snapId] ?? null;
      setInstalledSnap(installedSnap);

      setTimeout(
        () => {
          setIsInstallingSnap(false);
        },
        installedSnap ? 3000 : 1000,
      );

      return installedSnap;
    } catch (error) {
      void error;
      setIsInstallingSnap(false);
      throw error;
    }
  };

  return requestSnap;
};
