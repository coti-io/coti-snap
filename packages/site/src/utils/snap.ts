/**
 * Check if a snap ID is a local snap ID.
 *
 * @param snapId - The snap ID.
 * @returns True if it's a local Snap, or false otherwise.
 */
import type { GetSnapsResponse } from '../types';
import { defaultSnapOrigin } from '../config/snap';

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

const isLocalHost = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const shouldPreferLocalSnap = (): boolean => {
  if (defaultSnapOrigin.startsWith('local:')) {
    return true;
  }
  return isLocalHost();
};

const COTI_SNAP_NPM_PREFIX = 'npm:@coti-io/coti-snap';
const COTI_SNAP_PACKAGE_NAME = '@coti-io/coti-snap';

const isCotiSnap = (snapId: string): boolean => {
  return (
    snapId.startsWith(COTI_SNAP_NPM_PREFIX) ||
    snapId === COTI_SNAP_PACKAGE_NAME ||
    isLocalSnap(snapId)
  );
};

export const resolveSnapId = (
  snaps: GetSnapsResponse | null | undefined,
  preferredSnapId: string,
): string => {
  if (!snaps || Object.keys(snaps).length === 0) {
    return preferredSnapId;
  }

  if (shouldPreferLocalSnap()) {
    const localSnapId = Object.keys(snaps).find(isLocalSnap);
    if (localSnapId) {
      return localSnapId;
    }
  }

  if (snaps[preferredSnapId]) {
    return preferredSnapId;
  }

  // Only fall back to a COTI snap, never to an unrelated snap
  const cotiSnapId = Object.keys(snaps).find(isCotiSnap);
  return cotiSnapId ?? preferredSnapId;
};
