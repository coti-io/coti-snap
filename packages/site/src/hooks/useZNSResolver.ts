import { useState, useCallback } from 'react';
import { ZNSConnect } from 'zns-sdk';

interface ZNSResolverResult {
  address: string | null;
  isResolving: boolean;
  error: string | null;
  isZNSDomain: boolean;
}

/**
 * Hook to resolve .coti domain names to Ethereum addresses using ZNS
 */
export const useZNSResolver = () => {
  const [resolverState, setResolverState] = useState<ZNSResolverResult>({
    address: null,
    isResolving: false,
    error: null,
    isZNSDomain: false
  });

  /**
   * Check if input is a .coti domain
   */
  const isZNSDomain = useCallback((input: string): boolean => {
    return input.toLowerCase().endsWith('.coti');
  }, []);

  /**
   * Resolve .coti domain to Ethereum address
   */
  const resolveZNSDomain = useCallback(async (domain: string): Promise<string | null> => {
    try {
      setResolverState(prev => ({
        ...prev,
        isResolving: true,
        error: null,
        isZNSDomain: true
      }));
      const userOwnerAddress = await ZNSConnect().resolveDomain(domain);
      
      if (!userOwnerAddress) {
        throw new Error('No address found for this domain');
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(userOwnerAddress)) {
        throw new Error('Invalid address format returned by ZNS');
      }

      setResolverState(prev => ({
        ...prev,
        address: userOwnerAddress,
        isResolving: false,
        error: null
      }));

      return userOwnerAddress;
    } catch (error) {
      console.error('ZNS resolution failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to resolve domain';
      
      setResolverState(prev => ({
        ...prev,
        address: null,
        isResolving: false,
        error: errorMessage
      }));

      return null;
    }
  }, []);

  /**
   * Main resolution function - handles both domains and addresses
   */
  const resolveAddress = useCallback(async (input: string): Promise<string | null> => {
    if (!input.trim()) {
      setResolverState({
        address: null,
        isResolving: false,
        error: null,
        isZNSDomain: false
      });
      return null;
    }

    if (isZNSDomain(input)) {
      return await resolveZNSDomain(input);
    }

    if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
      setResolverState({
        address: input,
        isResolving: false,
        error: null,
        isZNSDomain: false
      });
      return input;
    }

    setResolverState({
      address: null,
      isResolving: false,
      error: 'Invalid address or domain format',
      isZNSDomain: false
    });

    return null;
  }, [isZNSDomain, resolveZNSDomain]);

  /**
   * Clear resolver state
   */
  const clearResolver = useCallback(() => {
    setResolverState({
      address: null,
      isResolving: false,
      error: null,
      isZNSDomain: false
    });
  }, []);

  return {
    ...resolverState,
    resolveAddress,
    clearResolver,
    isZNSDomain
  };
};