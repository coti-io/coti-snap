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

export const useImportedTokens = () => {
  const { address } = useAccount();
  const [importedTokens, setImportedTokensState] = useState<ImportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTokens = () => {
      try {
        if (address) {
          const tokens = getImportedTokensByAccount(address);
          setImportedTokensState(tokens);
        } else {
          setImportedTokensState([]);
        }
      } catch (error) {
        void error;
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadTokens();
  }, [address]);

  // Add a new token
  const addToken = useCallback((token: ImportedToken) => {
    if (!address) return;
    
    try {
      addImportedTokenByAccount(address, token);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address);
      setImportedTokensState(updatedTokens);
    } catch (error) {
      void error;
    }
  }, [address]);

  // Remove a token
  const removeToken = useCallback((tokenAddress: string) => {
    if (!address) return;
    
    try {
      removeImportedTokenByAccount(address, tokenAddress);
      // Reload tokens from localStorage to ensure consistency
      const updatedTokens = getImportedTokensByAccount(address);
      setImportedTokensState(updatedTokens);
    } catch (error) {
      void error;
    }
  }, [address]);

  const clearAllTokens = useCallback(() => {
    if (!address) return;
    
    try {
      clearImportedTokensByAccount(address);
      setImportedTokensState([]);
    } catch (error) {
      void error;
    }
  }, [address]);

  // Check if a token exists
  const hasToken = useCallback((tokenAddress: string) => {
    return importedTokens.some(
      token => token.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  }, [importedTokens]);

  // Refresh tokens from localStorage
  const refreshTokens = useCallback(() => {
    if (!address) return;
    
    try {
      const tokens = getImportedTokensByAccount(address);
      setImportedTokensState(tokens);
    } catch (error) {
      void error;
    }
  }, [address]);

  const getERC20TokensList = useCallback(() => {
    if (!address) return [];
    return getERC20TokensByAccount(address);
  }, [address]);

  const getNFTTokensList = useCallback(() => {
    if (!address) return [];
    return getNFTTokensByAccount(address);
  }, [address]);

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
