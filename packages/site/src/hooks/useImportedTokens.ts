import { useState, useEffect, useCallback, useRef } from 'react';
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
import { parseNFTAddress } from '../utils/tokenValidation';

export const useImportedTokens = () => {
  const { address, chain } = useAccount();
  const chainId = chain?.id;
  const [importedTokens, setImportedTokensState] = useState<ImportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const invokeSnap = useInvokeSnap();
  const hasSyncedRef = useRef(false);

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

  const syncFromSnap = useCallback(async () => {
    if (!address || !chainId) return;
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    try {
      const result = await invokeSnap({ method: 'get-tokens' }) as {
        success: boolean;
        tokens: Array<{
          address: string;
          name: string;
          symbol: string;
          decimals: string | null;
          type: string;
          tokenId?: string;
        }>;
      } | null;

      if (!result?.success || !result.tokens?.length) return;

      const localTokens = getImportedTokensByAccount(address, chainId);
      let hasNewTokens = false;

      for (const snapToken of result.tokens) {
        const isNFT = snapToken.type === 'ERC721' || snapToken.type === 'ERC1155';
        const localAddress = isNFT && snapToken.tokenId
          ? `${snapToken.address}-${snapToken.tokenId}`
          : snapToken.address;

        const alreadyLocal = localTokens.some(
          (t) => t.address.toLowerCase() === localAddress.toLowerCase()
        );

        if (!alreadyLocal) {
          const tokenToAdd: ImportedToken = {
            address: localAddress,
            name: snapToken.name,
            symbol: snapToken.symbol,
            ...(snapToken.decimals ? { decimals: parseInt(snapToken.decimals, 10) } : {}),
            type: (snapToken.type as ImportedToken['type']) || 'ERC20',
          };
          addImportedTokenByAccount(address, tokenToAdd, chainId);
          hasNewTokens = true;
        }
      }

      if (hasNewTokens) {
        const updatedTokens = getImportedTokensByAccount(address, chainId);
        setImportedTokensState(updatedTokens);
        notifyImportedTokensUpdated();
      }
    } catch (err) {
      console.warn('[syncFromSnap] Failed to sync tokens from snap:', err);
    }
  }, [address, chainId, invokeSnap]);

  useEffect(() => {
    hasSyncedRef.current = false;
  }, [address, chainId]);

  useEffect(() => {
    setIsLoading(true);
    loadTokens();
    syncFromSnap();
  }, [loadTokens, syncFromSnap]);

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
        const isNFT = token.type === 'ERC721' || token.type === 'ERC1155';
        let snapAddress = token.address;
        let snapTokenId: string | undefined;

        if (isNFT) {
          const parsed = parseNFTAddress(token.address);
          snapAddress = parsed.contractAddress;
          snapTokenId = parsed.tokenId || undefined;
        }

        await invokeSnap({
          method: 'import-token',
          params: {
            address: snapAddress,
            name: token.name,
            symbol: token.symbol,
            decimals: isNFT ? '0' : (token.decimals?.toString() || '18'),
            tokenType: token.type,
            ...(snapTokenId ? { tokenId: snapTokenId } : {}),
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
        const parsed = parseNFTAddress(tokenAddress);
        await invokeSnap({
          method: 'hide-token',
          params: {
            address: parsed.contractAddress,
            ...(parsed.tokenId ? { tokenId: parsed.tokenId } : {}),
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
