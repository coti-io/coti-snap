/**
 * Check if a snap ID is a local snap ID.
 *
 * @param snapId - The snap ID.
 * @returns True if it's a local Snap, or false otherwise.
 */
import type { GetSnapsResponse } from '../types';

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

const isLocalHost = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

export const shouldPreferLocalSnap = (): boolean => {
  if (typeof import.meta !== 'undefined') {
    const env = import.meta.env as { VITE_SNAP_ENV?: string } | undefined;
    if (env?.VITE_SNAP_ENV === 'local') {
      return true;
    }
  }
  return isLocalHost();
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

  const [fallbackSnapId] = Object.keys(snaps);
  return fallbackSnapId ?? preferredSnapId;
};
