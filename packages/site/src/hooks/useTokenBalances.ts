import type { BrowserProvider } from '@coti-io/coti-ethers';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useTokenOperations } from './useTokenOperations';
import type { ImportedToken } from '../types/token';

type UseTokenBalancesProps = {
  tokens: ImportedToken[];
  provider: BrowserProvider;
  aesKey?: string | null;
  cotiBalance?: string;
};

export const useTokenBalances = ({
  tokens,
  provider,
  aesKey,
  cotiBalance,
}: UseTokenBalancesProps) => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { decryptERC20Balance } = useTokenOperations(provider);
  const abortControllerRef = useRef<AbortController | null>(null);

  const tokenAddresses = useMemo(
    () => tokens.map((token) => token.address).join(','),
    [tokens],
  );

  const fetchBalances = useCallback(async () => {
    if (tokens.length === 0) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    const newBalances: Record<string, string> = {};

    try {
      if (cotiBalance) {
        newBalances.COTI = cotiBalance;
      }

      const batchSize = 3;
      for (let i = 0; i < tokens.length; i += batchSize) {
        if (signal.aborted) {
          return;
        }

        const batch = tokens.slice(i, i + batchSize);
        const batchPromises = batch.map(async (token) => {
          if (token.address && token.symbol !== 'COTI') {
            try {
              const balance = await decryptERC20Balance(
                token.address,
                aesKey || undefined,
                token.decimals,
              );
              return { address: token.address, balance: balance.toString() };
            } catch (error) {
              void error;
              return { address: token.address, balance: '0' };
            }
          }
          return null;
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach((result) => {
          if (result) {
            newBalances[result.address] = result.balance;
          }
        });

        if (i + batchSize < tokens.length) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      if (!signal.aborted) {
        setBalances(newBalances);
      }
    } catch (error) {
      if (!signal.aborted) {
        void error;
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [tokenAddresses, aesKey, cotiBalance, decryptERC20Balance, tokens]);

  useEffect(() => {
    fetchBalances();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    refetch: fetchBalances,
  };
};
