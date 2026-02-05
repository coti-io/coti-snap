import { useState, useCallback } from 'react';
import { Eip1193Provider, ethers } from 'ethers';
import { BrowserProvider, Contract, itUint } from '@coti-io/coti-ethers';
import { decryptUint, decryptString } from '@coti-io/coti-sdk-typescript';
import { abi as PRIVATE_ERC20_ABI } from '../abis/ERC20Confidential.json';
import { abi as PRIVATE_ERC721_ABI } from '../abis/ERC721Confidential.json';
import { abi as ERC721_ABI } from '../abis/ERC721.json';
import { abi as ERC1155_ABI } from '../abis/ERC1155.json';
import { abi as ERC20_ABI } from '../abis/ERC20.json';
import { removeImportedToken, removeImportedTokenByAccount } from '../utils/localStorage';
import { notifyImportedTokensUpdated } from '../utils/importedTokensEvents';
import { resolveTokenUri, extractImageUri, parseDataUriJson, fetchImageAsDataUri, fetchJsonWithIpfsFallback } from '../utils/nftMetadata';

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

export interface NFTMetadataResult {
  uri: string | null;
  metadata: Record<string, any> | null;
  image: string | null;
  originalImage?: string | null;
  imageDataUri?: string | null;
}

const decodePotentialString = (raw: unknown): string => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number' || typeof raw === 'bigint') {
    return raw.toString();
  }
  if (Array.isArray(raw)) {
    try {
      return raw.map(item => decodePotentialString(item)).join('');
    } catch (error) {
      void error;
      return '';
    }
  }
  if (typeof raw === 'object') {
    const value = (raw as { value?: unknown }).value;
    if (value !== undefined) {
      return decodePotentialString(value);
    }

    if (typeof (raw as { toString?: () => string }).toString === 'function') {
      return (raw as { toString: () => string }).toString();
    }
  }
  return '';
};

const imageDataUriCache = new Map<string, string>();

const getCachedImageDataUri = async (imageUrl: string): Promise<string | null> => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  if (imageDataUriCache.has(imageUrl)) {
    return imageDataUriCache.get(imageUrl)!;
  }
  const dataUri = await fetchImageAsDataUri(imageUrl);
  if (dataUri) {
    imageDataUriCache.set(imageUrl, dataUri);
  }
  return dataUri;
};

const buildMetadataResult = async (uri: string | null, metadata: Record<string, any> | null, tokenId?: string): Promise<NFTMetadataResult> => {
  console.log('[buildMetadataResult] Input metadata:', metadata);

  const { resolved, original, fallbacks } = extractImageUri(metadata ?? undefined, tokenId);
  console.log('[buildMetadataResult] Extracted image URIs - original:', original, 'resolved:', resolved, 'fallbacks:', fallbacks);

  const sources: string[] = [];

  const pushUnique = (value: string | null) => {
    if (!value) return;
    if (!sources.includes(value)) {
      sources.push(value);
    }
  };

  pushUnique(original);
  pushUnique(resolved);
  fallbacks.forEach(fallback => pushUnique(fallback));

  console.log('[buildMetadataResult] All sources to try:', sources);

  let fallbackImage: string | null = null;
  for (const source of sources) {
    if (!source) continue;
    if (/^https?:/i.test(source)) {
      fallbackImage = source;
      break;
    }
  }

  if (!fallbackImage && sources.length > 0) {
    fallbackImage = sources[0] ?? null;
  }

  let imageDataUri: string | null = null;
  for (const source of sources) {
    if (!source) continue;
    if (source.startsWith('data:')) {
      imageDataUri = source;
      break;
    }
    if (source.startsWith('ipfs://') || source.includes('/ipfs/')) {
      continue;
    }
    if (!/^https?:/i.test(source)) {
      continue;
    }
    const dataUri = await getCachedImageDataUri(source);
    if (dataUri) {
      imageDataUri = dataUri;
      break;
    }
  }

  const displayImage = imageDataUri ?? fallbackImage ?? null;

  console.log('[buildMetadataResult] Final result - displayImage:', displayImage, 'imageDataUri:', imageDataUri, 'fallbackImage:', fallbackImage);

  return {
    uri,
    metadata,
    image: displayImage,
    originalImage: original ?? null,
    imageDataUri: imageDataUri ?? null
  };
};

const fetchMetadataFromUri = async (uri: string, tokenId?: string): Promise<NFTMetadataResult> => {
  if (!uri) {
    return buildMetadataResult(null, null, tokenId);
  }

  if (uri.startsWith('data:application/json')) {
    const metadata = parseDataUriJson(uri);
    return buildMetadataResult(uri, metadata, tokenId);
  }

  try {
    const metadata = await fetchJsonWithIpfsFallback(uri);
    return buildMetadataResult(uri, metadata, tokenId);
  } catch {
    return buildMetadataResult(uri, null, tokenId);
  }
};

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

  const getTokenConfidentialStatus = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      const browserProvider = getBrowserProvider();
      const code = await browserProvider.getCode(tokenAddress);

      if (code === '0x') {
        throw new Error('No contract deployed at this address');
      }

      const confidentialSelectors = [
        ethers.id('accountEncryptionAddress(address)').slice(0, 10),
        ethers.id('transfer(address,(uint256,bytes))').slice(0, 10),
      ];

      let hasConfidentialMethods = false;
      for (const selector of confidentialSelectors) {
        if (code.includes(selector.slice(2))) {
          hasConfidentialMethods = true;
          break;
        }
      }

      if (hasConfidentialMethods) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error(`Failed to analyze token: ${error}`);
    }
  }, [getBrowserProvider]);

  // ERC20 Operations
  const transferERC20 = useCallback(async ({ tokenAddress, to, amount, aesKey }: TransferParams & { amount: string; aesKey?: string }) => {
    return withLoading(async () => {
      if (!amount) throw new Error('Amount is required for ERC20 transfer');
      if (!ethers.isAddress(to)) throw new Error('Invalid recipient address');

      const isConfidential = await getTokenConfidentialStatus(tokenAddress);
      const signer = await getBrowserProvider().getSigner();
      let tx;

      if (isConfidential) {
        if (!aesKey) throw new Error('AES key is required for private ERC20 transfer');
        signer.setAesKey(aesKey);
        const contract = new Contract(tokenAddress, PRIVATE_ERC20_ABI, signer);
        const encryptedAmount = await signer.encryptValue(
          ethers.toBigInt(amount),
          tokenAddress,
          getSelector("transfer(address,(uint256,bytes))")
        ) as itUint;
        tx = await (contract as any)["transfer(address,(uint256,bytes))"](
          to,
          encryptedAmount,
          { gasLimit: 12000000 }
        );
      } else {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        tx = await (contract as any)["transfer(address,uint256)"](
          to,
          ethers.toBigInt(amount),
          { gasLimit: 12000000 }
        );
      }

      if (!tx) {
        throw new Error('Transaction could not be initiated');
      }

      await tx.wait();
      return tx.hash ?? '';
    });
  }, [withLoading, getBrowserProvider, getTokenConfidentialStatus]);

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
      const isConfidential = await getTokenConfidentialStatus(tokenAddress);
      const browserProvider = getBrowserProvider();
      const signer = await browserProvider.getSigner();
      const signerAddress = await signer.getAddress();

      if (isConfidential) {
        const tokenContract = new ethers.Contract(tokenAddress, PRIVATE_ERC20_ABI, signer);
        let tokenBalance = null;
        try {
          const balanceOfMethod = tokenContract["balanceOf(address)"];
          if (balanceOfMethod) {
            tokenBalance = await balanceOfMethod(signerAddress);
          }
        } catch (error) {
          tokenBalance = null;
        }

        if (tokenBalance && aesKey) {
          const decryptedBalance = decryptUint(tokenBalance, aesKey);
          return decryptedBalance;
        } else if (tokenBalance && !aesKey) {
          return BigInt(tokenBalance.toString());
        } else {
          return 0n;
        }
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, browserProvider);
        let tokenBalance = null;
        try {
          const balanceOfMethod = tokenContract["balanceOf(address)"];
          if (balanceOfMethod) {
            tokenBalance = await balanceOfMethod(signerAddress);
          }
        } catch (error) {
          tokenBalance = null;
        }
        return tokenBalance ? BigInt(tokenBalance.toString()) : 0n;
      }
    });
  }, [withLoading, getBrowserProvider, getTokenConfidentialStatus]);

  const getNFTConfidentialStatus = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      const browserProvider = getBrowserProvider();
      const code = await browserProvider.getCode(tokenAddress);

      if (code === '0x') {
        throw new Error('No contract deployed at this address');
      }

      const confidentialInterface = new ethers.Interface(PRIVATE_ERC721_ABI);
      const mintFragment = confidentialInterface.getFunction('mint');
      const confidentialMintSelector = mintFragment?.selector ?? '';

      if (confidentialMintSelector && code.includes(confidentialMintSelector.slice(2))) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('[getNFTConfidentialStatus] Error:', error);
      throw new Error(`Failed to analyze NFT: ${error}`);
    }
  }, [getBrowserProvider]);

  const getERC721TokenURI = useCallback(async (tokenAddress: string, tokenId: string, aesKey?: string): Promise<string | null> => {
    if (aesKey) {
      try {
        const contract = await getContract(tokenAddress, PRIVATE_ERC721_ABI);
        const result = await (contract as any).tokenURI(tokenId);
        const decryptedURI = decryptString(result, aesKey);
        const cleanURI = decryptedURI?.replace(/\0/g, '').trim();
        if (cleanURI) return cleanURI;
      } catch (error) {
        void error;
      }
    }

    try {
      const contract = await getContract(tokenAddress, ERC721_ABI);
      const result = await (contract as any).tokenURI(tokenId);
      const uri = decodePotentialString(result);
      return uri || null;
    } catch (error) {
      throw new Error(`Failed to fetch token URI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [getContract]);

  const getERC1155TokenURI = useCallback(async (tokenAddress: string, tokenId: string): Promise<string | null> => {
    try {
      const contract = await getContract(tokenAddress, ERC1155_ABI);
      const result = await (contract as any).uri(tokenId);
      const uri = decodePotentialString(result);
      return uri || null;
    } catch (error) {
      throw new Error(`Failed to fetch token URI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [getContract]);

  const transferERC721 = useCallback(async ({ tokenAddress, to, tokenId }: TransferParams & { tokenId: string }) => {
    return withLoading(async () => {
      if (!tokenId) throw new Error('Token ID is required for ERC721 transfer');

      const isConfidential = await getNFTConfidentialStatus(tokenAddress);
      const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
      const contract = await getContract(tokenAddress, abi, true);
      const signer = await getBrowserProvider().getSigner();
      const fromAddress = await signer.getAddress();
      const tx = await (contract as any).transferFrom(fromAddress, to, tokenId);

      if (!tx) throw new Error('Transaction could not be initiated');
      await tx.wait();
      const nftKey = `${tokenAddress.toLowerCase()}-${tokenId.toLowerCase()}`;
      removeImportedToken(nftKey);
      removeImportedTokenByAccount(fromAddress, nftKey);
      notifyImportedTokensUpdated();
      return tx.hash ?? '';
    });
  }, [withLoading, getContract, getBrowserProvider, getNFTConfidentialStatus]);

  const getERC721Balance = useCallback(async (tokenAddress: string, account: string): Promise<string> => {
    return withLoading(async () => {
      const isConfidential = await getNFTConfidentialStatus(tokenAddress);
      const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
      const contract = await getContract(tokenAddress, abi);
      const balance = await (contract as any).balanceOf(account);

      if (!balance) throw new Error('Could not retrieve balance');
      return balance.toString();
    });
  }, [withLoading, getContract, getNFTConfidentialStatus]);

  const getERC721Details = useCallback(async (tokenAddress: string): Promise<TokenDetails> => {
    return withLoading(async () => {
      const isConfidential = await getNFTConfidentialStatus(tokenAddress);
      const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
      const contract = await getContract(tokenAddress, abi);
      const [name, symbol] = await Promise.all([
        (contract as any).name(),
        (contract as any).symbol()
      ]);

      if (!name || !symbol) throw new Error('Could not retrieve contract details');
      return { name, symbol };
    });
  }, [withLoading, getContract, getNFTConfidentialStatus]);

  const getERC721Owner = useCallback(async (tokenAddress: string, tokenId: string): Promise<string> => {
    try {
      const isConfidential = await getNFTConfidentialStatus(tokenAddress);
      const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
      const contract = await getContract(tokenAddress, abi);
      const owner = await (contract as any).ownerOf(tokenId);
      if (!owner) throw new Error('Could not retrieve owner');
      return owner.toString();
    } catch (error) {
      throw new Error(`Failed to fetch owner: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [getContract, getNFTConfidentialStatus]);

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
      if (!tx) {
        throw new Error('Transaction could not be initiated');
      }
      await tx.wait();
      return tx.hash ?? '';
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
      const uri = await getERC1155TokenURI(tokenAddress, tokenId);

      if (!uri) throw new Error('Could not retrieve token URI');
      return { uri };
    });
  }, [withLoading, getERC1155TokenURI]);

  const getNFTMetadata = useCallback(async ({ tokenAddress, tokenId, tokenType, aesKey }: { tokenAddress: string; tokenId: string; tokenType?: TokenType; aesKey?: string; }): Promise<NFTMetadataResult | null> => {
    if (!tokenAddress || !tokenId) return null;

    try {
      const rawUri = tokenType === 'ERC1155'
        ? await getERC1155TokenURI(tokenAddress, tokenId)
        : await getERC721TokenURI(tokenAddress, tokenId, aesKey);

      console.log('[NFT Metadata] Raw URI from contract:', rawUri);

      if (!rawUri) {
        return { uri: null, metadata: null, image: null };
      }

      const resolvedUri = resolveTokenUri(rawUri, tokenId);
      console.log('[NFT Metadata] Resolved URI:', resolvedUri);

      if (!resolvedUri) {
        return { uri: null, metadata: null, image: null };
      }

      const result = await fetchMetadataFromUri(resolvedUri, tokenId);
      console.log('[NFT Metadata] Fetched metadata result:', result);

      return {
        uri: resolvedUri,
        metadata: result.metadata,
        image: result.image
      };
    } catch (error) {
      console.error('[NFT Metadata] Error:', error);
      throw new Error(`Failed to fetch NFT metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [getERC1155TokenURI, getERC721TokenURI]);

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
      return tx.hash ?? '';
    });
  }, [withLoading, getBrowserProvider]);

  const getTokenInfo = useCallback(async (address: string): Promise<TokenInfo> => {
    return withLoading(async () => {
      try {
        const provider = getBrowserProvider();
        const code = await provider.getCode(address);
        if (code === '0x') {
          throw new Error('This address does not contain a smart contract. Please verify the token contract address.');
        }

        const isConfidential = await getTokenConfidentialStatus(address);
        const abi = isConfidential ? PRIVATE_ERC20_ABI : ERC20_ABI;
        const contract = new ethers.Contract(address, abi, provider);

        if (!contract.name || !contract.symbol || !contract.decimals) {
          throw new Error('Contract does not implement required ERC20 methods');
        }

        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();

        if (!name || !symbol || decimals === undefined || decimals === null) {
          throw new Error('Invalid token contract: missing required token information');
        }

        return { address, name, symbol, decimals };
      } catch (error) {
        if (error instanceof Error && error.message.includes('could not decode result data')) {
          throw new Error('This contract address does not appear to be a valid ERC20 token. Please verify the address is correct.');
        }
        throw error;
      }
    });
  }, [withLoading, getBrowserProvider, getTokenConfidentialStatus]);

  // NFT Information
  const getNFTInfo = useCallback(async (address: string): Promise<NFTInfo> => {
    return withLoading(async () => {
      const isConfidential = await getNFTConfidentialStatus(address);
      const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;

      try {
        const contract = await getContract(address, abi, true) as unknown as IERC721;
        const [name, symbol] = await Promise.all([
          contract.name(),
          contract.symbol()
        ]);

        const cleanName = name?.trim() || '';
        const cleanSymbol = symbol?.trim() || '';

        if (!cleanName || !cleanSymbol) {
          throw new Error('Invalid NFT contract');
        }

        return { address, name: cleanName, symbol: cleanSymbol };
      } catch (error) {
        const fallbackAbi = isConfidential ? ERC721_ABI : PRIVATE_ERC721_ABI;
        try {
          const fallbackContract = await getContract(address, fallbackAbi, true) as unknown as IERC721;
          const [name, symbol] = await Promise.all([
            fallbackContract.name(),
            fallbackContract.symbol()
          ]);

          const cleanName = name?.trim() || '';
          const cleanSymbol = symbol?.trim() || '';

          if (!cleanName || !cleanSymbol) {
            throw new Error('Invalid NFT contract');
          }

          return { address, name: cleanName, symbol: cleanSymbol };
        } catch (fallbackError) {
          throw new Error('Invalid NFT contract - unable to read name and symbol');
        }
      }
    });
  }, [withLoading, getContract, getNFTConfidentialStatus]);

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
    getERC721TokenURI,
    getNFTMetadata,
    getERC721Owner,
    transferERC1155,
    getERC1155Balance,
    getERC1155Details,
    getERC1155TokenURI,
    transferCOTI,
    getTokenInfo,
    getNFTInfo,
    addTokenToMetaMask,
    addNFTToMetaMask,
    addERC1155ToMetaMask,
  };
}; 
