import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import {
  getImportedTokensByAccount,
  addImportedTokenByAccount,
  removeImportedTokenByAccount,
  clearImportedTokensByAccount,
  getERC20TokensByAccount,
  getNFTTokensByAccount
} from '../utils/localStorage';
import { ImportedToken } from '../types/token';
import { subscribeImportedTokens, notifyImportedTokensUpdated } from '../utils/importedTokensEvents';
import { useInvokeSnap } from './useInvokeSnap';

export const useImportedTokens = () => {
  const { address, chain } = useAccount();
  const chainId = chain?.id;
  const [importedTokens, setImportedTokensState] = useState<ImportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const invokeSnap = useInvokeSnap();

  const loadTokens = useCallback(() => {
    try {
      if (address && chainId) {
        const tokens = getImportedTokensByAccount(address, chainId);
        setImportedTokensState(tokens);
      } else {
        setImportedTokensState([]);
      }
    } catch (error) {
      void error;
      setImportedTokensState([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    setIsLoading(true);
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    const unsubscribe = subscribeImportedTokens(() => {
      setIsLoading(true);
      loadTokens();
    });

    return unsubscribe;
  }, [loadTokens]);

  const addToken = useCallback(async (token: ImportedToken) => {
    if (!address || !chainId) return;

    try {
      addImportedTokenByAccount(address, token, chainId);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address, chainId);
      setImportedTokensState(updatedTokens);
      notifyImportedTokensUpdated();

      try {
        await invokeSnap({
          method: 'import-token',
          params: {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals?.toString() || '18',
            tokenType: token.type,
          },
        });
      } catch (snapError) {
        console.warn('Failed to sync token to snap:', snapError);
      }
    } catch (error) {
      void error;
    }
  }, [address, chainId, invokeSnap]);

  const removeToken = useCallback(async (tokenAddress: string) => {
    if (!address || !chainId) return;

    try {
      removeImportedTokenByAccount(address, tokenAddress, chainId);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address, chainId);
      setImportedTokensState(updatedTokens);
      notifyImportedTokensUpdated();

      try {
        await invokeSnap({
          method: 'hide-token',
          params: {
            address: tokenAddress,
          },
        });
      } catch (snapError) {
        console.warn('Failed to sync token removal to snap:', snapError);
      }
    } catch (error) {
      void error;
    }
  }, [address, chainId, invokeSnap]);

  const clearAllTokens = useCallback(() => {
    if (!address || !chainId) return;

    try {
      clearImportedTokensByAccount(address, chainId);
      setImportedTokensState([]);
      notifyImportedTokensUpdated();
    } catch (error) {
      void error;
    }
  }, [address, chainId]);

  // Check if a token exists
  const hasToken = useCallback((tokenAddress: string) => {
    return importedTokens.some(
      token => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  }, [importedTokens]);
  
  // Refresh tokens from localStorage
  const refreshTokens = useCallback(() => {
    if (!address || !chainId) return;

    try {
      const tokens = getImportedTokensByAccount(address, chainId);
      setImportedTokensState(tokens);
    } catch (error) {
      void error;
    }
  }, [address, chainId]);

  const getERC20TokensList = useCallback(() => {
    if (!address || !chainId) return [];
    return getERC20TokensByAccount(address, chainId);
  }, [address, chainId]);

  const getNFTTokensList = useCallback(() => {
    if (!address || !chainId) return [];
    return getNFTTokensByAccount(address, chainId);
  }, [address, chainId]);

  return {
    importedTokens,
    isLoading,
    addToken,
    removeToken,
    clearAllTokens,
    hasToken,
    refreshTokens,
    getERC20TokensList,
    getNFTTokensList
  };
};
