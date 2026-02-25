import { useCallback, useEffect, useRef } from 'react';

import { useRequest } from './useRequest';
import { defaultSnapOrigin } from '../config';
import type { GetSnapsResponse } from '../types';
import { resolveSnapId } from '../utils/snap';

export type InvokeSnapParams = {
  method: string;
  params?: Record<string, unknown>;
};

/**
 * Utility hook to wrap the `wallet_invokeSnap` method.
 *
 * @param snapId - The Snap ID to invoke. Defaults to the snap ID specified in the
 * config.
 * @returns The invokeSnap wrapper method.
 */
export const useInvokeSnap = (snapId = defaultSnapOrigin) => {
  const request = useRequest();
  const resolvedSnapIdRef = useRef<string | null>(null);

  useEffect(() => {
    resolvedSnapIdRef.current = null;
  }, [snapId]);

  const getResolvedSnapId = useCallback(async (): Promise<string> => {
    if (resolvedSnapIdRef.current) {
      return resolvedSnapIdRef.current;
    }

    try {
      const snaps = (await request({
        method: 'wallet_getSnaps',
      })) as GetSnapsResponse;
      const resolved = resolveSnapId(snaps, snapId);
      resolvedSnapIdRef.current = resolved;
      return resolved;
    } catch (error) {
      void error;
      resolvedSnapIdRef.current = snapId;
      return snapId;
    }
  }, [request, snapId]);

  /**
   * Invoke the requested Snap method.
   *
   * @param params - The invoke params.
   * @param params.method - The method name.
   * @param params.params - The method params.
   * @returns The Snap response.
   */
  const invokeSnap = useCallback(
    async ({ method, params }: InvokeSnapParams) => {
      const resolvedSnapId = await getResolvedSnapId();
      if (import.meta.env.DEV) {
        console.info('[snap] invoke', { method, snapId: resolvedSnapId });
      }
      return request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: resolvedSnapId,
          request: params ? { method, params } : { method },
        },
      });
    },
    [request, getResolvedSnapId],
  );

  return invokeSnap;
};
