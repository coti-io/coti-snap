import { useState, useCallback } from 'react';
import { Eip1193Provider, ethers } from 'ethers';
import { BrowserProvider, ctUint, Contract, itUint } from '@coti-io/coti-ethers';
import { abi as PRIVATE_ERC20_ABI } from '../abis/ERC20Confidential.json';
import { abi as PRIVATE_ERC721_ABI } from '../abis/ERC721Confidential.json';
import { abi as ERC1155_ABI } from '../abis/ERC1155.json';
import { removeImportedToken } from '../utils/localStorage';

// Helper function to get function selector
const getSelector = (functionSignature: string): string => {
  return ethers.id(functionSignature).slice(0, 10);
};

export type TokenType = 'ERC20' | 'ERC721' | 'ERC1155';

export interface TokenDetails {
  name: string;
  symbol: string;
  decimals?: number;
  uri?: string;
}

export interface ERC1155TokenDetails {
  uri: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface NFTInfo {
  address: string;
  name: string;
  symbol: string;
}

export interface TransferParams {
  tokenAddress: string;
  to: string;
  amount?: string;
  tokenId?: string;
  aesKey?: string;
}

export interface ImportTokenParams {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
  tokenId?: string;
}

// Interface for ERC20 contract
interface IERC20 {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  balanceOf(account: string): Promise<string>;
}

// Interface for ERC721 contract
interface IERC721 {
  name(): Promise<string>;
  symbol(): Promise<string>;
  balanceOf(account: string): Promise<string>;
  ownerOf(tokenId: string): Promise<string>;
}

// Error types
export class TokenOperationError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'TokenOperationError';
  }
}

/**
 * Custom hook for interacting with ERC20, ERC721, and ERC1155 tokens.
 * Provides functions for transferring tokens, checking balances, and retrieving contract details.
 * @param provider - The ethers provider to interact with the blockchain.
 * @returns An object containing loading state, error state, and functions for token operations.
 */
export const useTokenOperations = (provider: BrowserProvider) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure we have a BrowserProvider
  const getBrowserProvider = useCallback((): BrowserProvider => {
    if (provider instanceof BrowserProvider) {
      return provider;
    }
    return new BrowserProvider(window.ethereum as Eip1193Provider);
  }, [provider]);

  // Generic error handler
  const handleError = useCallback((error: unknown, operation: string): void => {
    const errorMessage = error instanceof Error ? error.message : `Unknown error during ${operation}`;
    setError(errorMessage);
  }, []);

  // Generic loading wrapper
  const withLoading = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (err) {
      handleError(err, 'operation');
      throw err; // Re-throw the error after handling it
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get contract instance
  const getContract = useCallback(async (address: string, abi: any[], useSigner = false) => {
    const browserProvider = getBrowserProvider();
    const contractProvider = useSigner ? await browserProvider.getSigner() : browserProvider;
    return new ethers.Contract(address, abi, contractProvider);
  }, [getBrowserProvider]);

  // ERC20 Operations
  const transferERC20 = useCallback(async ({ tokenAddress, to, amount, aesKey }: TransferParams & { amount: string; aesKey: string }) => {
    return withLoading(async () => {
      if (!amount) throw new Error('Amount is required for ERC20 transfer');
      if (!aesKey) throw new Error('AES key is required for ERC20 transfer');
      if (!ethers.isAddress(to)) throw new Error('Invalid recipient address');
      const signer = await getBrowserProvider().getSigner();
      signer.setAesKey(aesKey);
      const contract = new Contract(tokenAddress, PRIVATE_ERC20_ABI, signer);
      const encryptedAmount = await signer.encryptValue(
        ethers.toBigInt(amount),
        tokenAddress,
        getSelector("transfer(address,(uint256,bytes))")
      ) as itUint;
      const tx = await (contract as any)["transfer(address,(uint256,bytes))"](
        to, 
        encryptedAmount, 
        { gasLimit: 12000000 }
      );
      await tx.wait();
      return true;
    });
  }, [withLoading, getBrowserProvider]);

  const getERC20Details = useCallback(async (tokenAddress: string): Promise<TokenDetails> => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, PRIVATE_ERC20_ABI);
      const [name, symbol, decimals] = await Promise.all([
        (contract as any).name(),
        (contract as any).symbol(),
        (contract as any).decimals()
      ]);
      
      if (!name || !symbol || decimals === undefined) {
        throw new Error('Could not retrieve contract details');
      }
      
      return { name, symbol, decimals };
    });
  }, [withLoading, getContract]);

  const decryptERC20Balance = useCallback(async (tokenAddress: string, aesKey?: string) => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, PRIVATE_ERC20_ABI, true);
      const signer = await getBrowserProvider().getSigner();
      
      if (!contract || !contract.balanceOf) {
        throw new Error('Contract or balanceOf method not available');
      }
      
      const balanceOfMethod = contract["balanceOf(address)"];
      if (!balanceOfMethod) {
        throw new Error('balanceOf method not available on contract');
      }
      
      const ctBalance = await balanceOfMethod(await signer.getAddress()) as ctUint;
      
      if (aesKey) {
        // If there's an AES key, decrypt the balance
        signer.setAesKey(aesKey);
        return await signer.decryptValue(BigInt(ctBalance));
      } else {
        // If there's no AES key, return the encrypted balance as string
        return ctBalance;
      }
    });
  }, [withLoading, getContract, getBrowserProvider]);

  // ERC721 Operations
  const transferERC721 = useCallback(async ({ tokenAddress, to, tokenId }: TransferParams & { tokenId: string }) => {
    return withLoading(async () => {
      if (!tokenId) throw new Error('Token ID is required for ERC721 transfer');
      
      const contract = await getContract(tokenAddress, PRIVATE_ERC721_ABI, true);
      const signer = await getBrowserProvider().getSigner();
      const tx = await (contract as any).transferFrom(await signer.getAddress(), to, tokenId);
      
      if (!tx) throw new Error('Transaction could not be initiated');
      await tx.wait();
      const nftKey = tokenAddress + '-' + tokenId;
      removeImportedToken(nftKey);
      return true;
    });
  }, [withLoading, getContract, getBrowserProvider]);

  const getERC721Balance = useCallback(async (tokenAddress: string, account: string): Promise<string> => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, PRIVATE_ERC721_ABI);
      const balance = await (contract as any).balanceOf(account);
      
      if (!balance) throw new Error('Could not retrieve balance');
      return balance.toString();
    });
  }, [withLoading, getContract]);

  const getERC721Details = useCallback(async (tokenAddress: string): Promise<TokenDetails> => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, PRIVATE_ERC721_ABI);
      const [name, symbol] = await Promise.all([
        (contract as any).name(),
        (contract as any).symbol()
      ]);
      
      if (!name || !symbol) throw new Error('Could not retrieve contract details');
      return { name, symbol };
    });
  }, [withLoading, getContract]);

  // ERC1155 Operations
  const transferERC1155 = useCallback(async ({ tokenAddress, to, tokenId, amount }: TransferParams & { tokenId: string; amount: string }) => {
    return withLoading(async () => {
      if (!tokenId || !amount) throw new Error('Token ID and amount are required for ERC1155 transfer');
      if (!ethers.isAddress(to)) throw new Error('Invalid recipient address');
      const signer = await getBrowserProvider().getSigner();
      const contract = new ethers.Contract(tokenAddress, ERC1155_ABI, signer);
      const fromAddress = await signer.getAddress();
      const tx = await (contract as any).safeTransferFrom(
        fromAddress,
        to,
        tokenId,
        amount,
        '0x',
        { gasLimit: 12000000 }
      );
      await tx.wait();
      return true;
    });
  }, [withLoading, getBrowserProvider]);

  const getERC1155Balance = useCallback(async (tokenAddress: string, account: string, tokenId: string): Promise<string> => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, ERC1155_ABI);
      const balance = await (contract as any).balanceOf(account, tokenId);
      if (!balance) throw new Error('Could not retrieve balance');
      return balance.toString();
    });
  }, [withLoading, getContract]);

  const getERC1155Details = useCallback(async (tokenAddress: string, tokenId: string): Promise<ERC1155TokenDetails> => {
    return withLoading(async () => {
      const contract = await getContract(tokenAddress, ERC1155_ABI);
      const uri = await (contract as any).uri(tokenId);
      
      if (!uri) throw new Error('Could not retrieve token URI');
      return { uri };
    });
  }, [withLoading, getContract]);

  // COTI/Ether Operations
  const transferCOTI = useCallback(async ({ to, amount }: { to: string; amount: string }) => {
    return withLoading(async () => {
      const signer = await getBrowserProvider().getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
      
      if (!tx) throw new Error('Transaction could not be initiated');
      await tx.wait();
      return true;
    });
  }, [withLoading, getBrowserProvider]);

  // Token Information
  const getTokenInfo = useCallback(async (address: string): Promise<TokenInfo> => {
    return withLoading(async () => {
      const contract = await getContract(address, PRIVATE_ERC20_ABI, true) as unknown as IERC20;
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      if (!name || !symbol || decimals === undefined || decimals === null) {
        throw new Error('Invalid token contract');
      }
      
      return { address, name, symbol, decimals };
    });
  }, [withLoading, getContract]);

  // NFT Information
  const getNFTInfo = useCallback(async (address: string): Promise<NFTInfo> => {
    return withLoading(async () => {
      const contract = await getContract(address, PRIVATE_ERC721_ABI, true) as unknown as IERC721;
      const [name, symbol] = await Promise.all([
        contract.name(),
        contract.symbol()
      ]);
      
      if (!name || !symbol) {
        throw new Error('Invalid NFT contract');
      }
      
      return { address, name, symbol };
    });
  }, [withLoading, getContract]);

  // MetaMask Integration
  const addTokenToMetaMask = useCallback(async ({ address, symbol, decimals, image }: ImportTokenParams) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address, symbol, decimals, image },
      },
    });
  }, []);

  const addNFTToMetaMask = useCallback(async ({ address, symbol, decimals, image, tokenId }: ImportTokenParams & { tokenId: string }) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: { address, symbol, decimals, image, tokenId },
      },
    });
  }, []);

  const addERC1155ToMetaMask = useCallback(async ({ address, symbol, decimals, image, tokenId }: ImportTokenParams & { tokenId: string }) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    return window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC1155',
        options: { address, symbol, decimals, image, tokenId },
      },
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    transferERC20,
    getERC20Details,
    decryptERC20Balance,
    transferERC721,
    getERC721Balance,
    getERC721Details,
    transferERC1155,
    getERC1155Balance,
    getERC1155Details,
    transferCOTI,
    getTokenInfo,
    getNFTInfo,
    addTokenToMetaMask,
    addNFTToMetaMask,
    addERC1155ToMetaMask,
  };
}; 