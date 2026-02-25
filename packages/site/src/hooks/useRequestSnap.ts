import { useMetaMaskContext } from './MetamaskContext';
import { useRequest } from './useRequest';
import { defaultSnapOrigin } from '../config';
import type { Snap } from '../types';
import { shouldPreferLocalSnap } from '../utils/snap';

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

      const useLocalFallback =
        shouldPreferLocalSnap() && snapId === defaultSnapOrigin;
      const localSnapId = useLocalFallback
        ? `local:${import.meta.env.VITE_SNAP_LOCAL_URL ?? 'http://localhost:8080'}`
        : null;

      let snaps: Record<string, Snap> | null = null;

      if (localSnapId) {
        try {
          snaps = (await request({
            method: 'wallet_requestSnaps',
            params: {
              [localSnapId]: version ? { version } : {},
            },
          })) as Record<string, Snap>;
        } catch (error) {
          void error;
          snaps = null;
        }
      }

      if (!snaps) {
        snaps = (await request({
          method: 'wallet_requestSnaps',
          params: {
            [snapId]: version ? { version } : {},
          },
        })) as Record<string, Snap>;
      }

      // Updates the `installedSnap` context variable since we just installed the Snap.
      const installedSnap =
        (localSnapId ? snaps?.[localSnapId] : null) ?? snaps?.[snapId] ?? null;
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
