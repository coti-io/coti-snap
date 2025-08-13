import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../types/token';
import { useTokenOperations } from './useTokenOperations';

interface UseTokenBalancesProps {
  tokens: ImportedToken[];
  provider: BrowserProvider;
  aesKey?: string | null;
  cotiBalance?: string;
}

export const useTokenBalances = ({
  tokens,
  provider,
  aesKey,
  cotiBalance
}: UseTokenBalancesProps) => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { decryptERC20Balance } = useTokenOperations(provider);

  const fetchBalances = useCallback(async () => {
    
    if (!aesKey || tokens.length === 0) return;

    setIsLoading(true);
    const newBalances: Record<string, string> = {};

    try {
      if (cotiBalance) {
        newBalances.COTI = cotiBalance;
      }

      for (const token of tokens) {
        if (token.address && token.symbol !== 'COTI') {
          try {
            const balance = await decryptERC20Balance(token.address, aesKey);
            newBalances[token.symbol] = balance.toString();
          } catch (error) {
            console.error(`Error fetching balance for ${token.symbol}:`, error);
            newBalances[token.symbol] = '0';
          }
        }
      }

      setBalances(newBalances);
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tokens, aesKey, cotiBalance, decryptERC20Balance]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    refetch: fetchBalances
  };
};