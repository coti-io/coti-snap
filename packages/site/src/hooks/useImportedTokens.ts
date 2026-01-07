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

export const useImportedTokens = () => {
  const { address, chain } = useAccount();
  const chainId = chain?.id;
  const [importedTokens, setImportedTokensState] = useState<ImportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Add a new token
  const addToken = useCallback((token: ImportedToken) => {
    if (!address || !chainId) return;

    try {
      addImportedTokenByAccount(address, token, chainId);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address, chainId);
      setImportedTokensState(updatedTokens);
      notifyImportedTokensUpdated();
    } catch (error) {
      void error;
    }
  }, [address, chainId]);

  // Remove a token
  const removeToken = useCallback((tokenAddress: string) => {
    if (!address || !chainId) return;

    try {
      removeImportedTokenByAccount(address, tokenAddress, chainId);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address, chainId);
      setImportedTokensState(updatedTokens);
      notifyImportedTokensUpdated();
    } catch (error) {
      void error;
    }
  }, [address, chainId]);

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
