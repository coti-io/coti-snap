import type { itUint } from '@coti-io/coti-ethers';
import { BrowserProvider, Contract } from '@coti-io/coti-ethers';
import * as CotiSDK from '@coti-io/coti-sdk-typescript';
import { ethers } from 'ethers';
import type { Eip1193Provider } from 'ethers';
import { useState, useCallback } from 'react';

import { abi as ERC1155_ABI } from '../abis/ERC1155.json';
import { abi as ERC20_ABI } from '../abis/ERC20.json';
import { abi as PRIVATE_ERC20_ABI } from '../abis/ERC20Confidential.json';
import PRIVATE_ERC20_256_ABI from '../abis/ERC20Confidential256.json';
import { abi as ERC721_ABI } from '../abis/ERC721.json';
import { abi as PRIVATE_ERC721_ABI } from '../abis/ERC721Confidential.json';
import { notifyImportedTokensUpdated } from '../utils/importedTokensEvents';
import {
  removeImportedToken,
  removeImportedTokenByAccount,
} from '../utils/localStorage';
import {
  resolveTokenUri,
  extractImageUri,
  parseDataUriJson,
  fetchImageAsDataUri,
  fetchJsonWithIpfsFallback,
} from '../utils/nftMetadata';

const { decryptUint, decryptString } = CotiSDK;
const decryptUint256 = (CotiSDK as { decryptUint256?: unknown }).decryptUint256 as
  | ((ciphertext: unknown, userKey: string) => bigint)
  | undefined;

const INSANE_BALANCE_BASE = 1000000000000n;

const normalizeDecimals = (decimals?: number): number => {
  if (decimals === undefined || decimals === null) {
    return 18;
  }
  if (!Number.isFinite(decimals)) {
    return 18;
  }
  if (decimals < 0) {
    return 0;
  }
  if (decimals > 36) {
    return 36;
  }
  return Math.floor(decimals);
};

const isZeroValue = (value: unknown): boolean => {
  if (typeof value === 'bigint') {
    return value === 0n;
  }
  if (typeof value === 'number') {
    return value === 0;
  }
  if (typeof value === 'string') {
    return value === '0';
  }
  return false;
};

// Helper function to get function selector
const getSelector = (functionSignature: string): string => {
  return ethers.id(functionSignature).slice(0, 10);
};

const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
];

const PRIVATE_ERC20_64_INTERFACE_ID = '0x8409a9cf';
const PRIVATE_ERC20_256_INTERFACE_ID = '0xdfeb393e';

const splitCt128 = (value: unknown): { high: bigint; low: bigint } | unknown => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'high' in value &&
    'low' in value
  ) {
    return value as { high: bigint; low: bigint };
  }
  if (typeof value === 'bigint') {
    const mask = (1n << 64n) - 1n;
    return { high: value >> 64n, low: value & mask };
  }
  return value;
};

const normalizeItUint256ForAbi = (value: any): any => {
  const cipher = value?.ciphertext ?? value;
  if (
    cipher?.high?.high !== undefined &&
    cipher?.high?.low !== undefined &&
    cipher?.low?.high !== undefined &&
    cipher?.low?.low !== undefined
  ) {
    return value;
  }

  const high = splitCt128(cipher?.ciphertextHigh ?? cipher?.high);
  const low = splitCt128(cipher?.ciphertextLow ?? cipher?.low);

  if (
    high &&
    low &&
    typeof high === 'object' &&
    typeof low === 'object' &&
    'high' in high &&
    'low' in high &&
    'high' in low &&
    'low' in low
  ) {
    return {
      ciphertext: { high, low },
      signature: value?.signature ?? cipher?.signature,
    };
  }

  return value;
};

const decryptCtUint256 = (ciphertext: any, aesKey: string): bigint => {
  if (
    ciphertext?.high?.high !== undefined &&
    ciphertext?.high?.low !== undefined &&
    ciphertext?.low?.high !== undefined &&
    ciphertext?.low?.low !== undefined
  ) {
    const d1 = decryptUint(ciphertext.high.high, aesKey);
    const d2 = decryptUint(ciphertext.high.low, aesKey);
    const d3 = decryptUint(ciphertext.low.high, aesKey);
    const d4 = decryptUint(ciphertext.low.low, aesKey);
    return (d1 << 192n) + (d2 << 128n) + (d3 << 64n) + d4;
  }

  if (
    decryptUint256 &&
    ciphertext?.ciphertextHigh !== undefined &&
    ciphertext?.ciphertextLow !== undefined
  ) {
    return decryptUint256(ciphertext, aesKey);
  }

  return 0n;
};

const isZeroCtUint256 = (ciphertext: any): boolean => {
  if (!ciphertext) {
    return false;
  }
  if (isZeroValue(ciphertext)) {
    return true;
  }
  if (
    ciphertext?.high?.high !== undefined &&
    ciphertext?.high?.low !== undefined &&
    ciphertext?.low?.high !== undefined &&
    ciphertext?.low?.low !== undefined
  ) {
    return (
      isZeroValue(ciphertext.high.high) &&
      isZeroValue(ciphertext.high.low) &&
      isZeroValue(ciphertext.low.high) &&
      isZeroValue(ciphertext.low.low)
    );
  }

  if (
    ciphertext?.ciphertextHigh !== undefined &&
    ciphertext?.ciphertextLow !== undefined
  ) {
    return (
      isZeroValue(ciphertext.ciphertextHigh) &&
      isZeroValue(ciphertext.ciphertextLow)
    );
  }

  return false;
};

const isInsaneDecryptedValue = (value: bigint, decimals?: number): boolean => {
  const safeDecimals = normalizeDecimals(decimals);
  const threshold = INSANE_BALANCE_BASE * 10n ** BigInt(safeDecimals);
  return value > threshold;
};

const isCtUint256Shape = (value: any): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const hasNested =
    value?.high?.high !== undefined &&
    value?.high?.low !== undefined &&
    value?.low?.high !== undefined &&
    value?.low?.low !== undefined;
  const hasFlat =
    value?.ciphertextHigh !== undefined &&
    value?.ciphertextLow !== undefined;
  return hasNested || hasFlat;
};

const probeConfidentialVersion256 = async (
  tokenAddress: string,
  provider: any,
  accountAddress?: string,
): Promise<256 | undefined> => {
  try {
    const contract = new ethers.Contract(
      tokenAddress,
      PRIVATE_ERC20_256_ABI,
      provider,
    );
    const targetAddress =
      accountAddress && ethers.isAddress(accountAddress)
        ? accountAddress
        : ethers.ZeroAddress;
    const balance = await (contract as any)['balanceOf(address)'](
      targetAddress,
    );
    if (isCtUint256Shape(balance)) {
      return 256;
    }
  } catch (error) {
    void error;
  }
  return undefined;
};

export type TokenType = 'ERC20' | 'ERC721' | 'ERC1155';

export type TokenDetails = {
  name: string;
  symbol: string;
  decimals?: number;
  uri?: string;
};

export type ERC1155TokenDetails = {
  uri: string;
};

export type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type NFTInfo = {
  address: string;
  name: string;
  symbol: string;
};

export type TransferParams = {
  tokenAddress: string;
  to: string;
  amount?: string;
  tokenId?: string;
  aesKey?: string;
};

export type ImportTokenParams = {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
  tokenId?: string;
};

export type NFTMetadataResult = {
  uri: string | null;
  metadata: Record<string, any> | null;
  image: string | null;
  originalImage?: string | null;
  imageDataUri?: string | null;
};

const decodePotentialString = (raw: unknown): string => {
  if (!raw) {
    return '';
  }
  if (typeof raw === 'string') {
    return raw;
  }
  if (typeof raw === 'number' || typeof raw === 'bigint') {
    return raw.toString();
  }
  if (Array.isArray(raw)) {
    try {
      return raw.map((item) => decodePotentialString(item)).join('');
    } catch (error) {
      void error;
      return '';
    }
  }
  if (typeof raw === 'object') {
    const { value } = raw as { value?: unknown };
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

const getCachedImageDataUri = async (
  imageUrl: string,
): Promise<string | null> => {
  if (!imageUrl) {
    return null;
  }
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

const buildMetadataResult = async (
  uri: string | null,
  metadata: Record<string, any> | null,
  tokenId?: string,
): Promise<NFTMetadataResult> => {
  console.log('[buildMetadataResult] Input metadata:', metadata);

  const { resolved, original, fallbacks } = extractImageUri(
    metadata ?? undefined,
    tokenId,
  );
  console.log(
    '[buildMetadataResult] Extracted image URIs - original:',
    original,
    'resolved:',
    resolved,
    'fallbacks:',
    fallbacks,
  );

  const sources: string[] = [];

  const pushUnique = (value: string | null) => {
    if (!value) {
      return;
    }
    if (!sources.includes(value)) {
      sources.push(value);
    }
  };

  pushUnique(original);
  pushUnique(resolved);
  fallbacks.forEach((fallback) => pushUnique(fallback));

  console.log('[buildMetadataResult] All sources to try:', sources);

  let fallbackImage: string | null = null;
  for (const source of sources) {
    if (!source) {
      continue;
    }
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
    if (!source) {
      continue;
    }
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

  console.log(
    '[buildMetadataResult] Final result - displayImage:',
    displayImage,
    'imageDataUri:',
    imageDataUri,
    'fallbackImage:',
    fallbackImage,
  );

  return {
    uri,
    metadata,
    image: displayImage,
    originalImage: original ?? null,
    imageDataUri: imageDataUri ?? null,
  };
};

const fetchMetadataFromUri = async (
  uri: string,
  tokenId?: string,
): Promise<NFTMetadataResult> => {
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
  } catch (error) {
    console.warn('[fetchMetadataFromUri] Failed to fetch metadata', error);
    return buildMetadataResult(uri, null, tokenId);
  }
};

// Interface for ERC20 contract
type IERC20 = {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  balanceOf(account: string): Promise<string>;
};

// Interface for ERC721 contract
type IERC721 = {
  name(): Promise<string>;
  symbol(): Promise<string>;
  balanceOf(account: string): Promise<string>;
  ownerOf(tokenId: string): Promise<string>;
};

// Error types
export class TokenOperationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'TokenOperationError';
  }
}

/**
 * Custom hook for interacting with ERC20, ERC721, and ERC1155 tokens.
 * Provides functions for transferring tokens, checking balances, and retrieving contract details.
 *
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : `Unknown error during ${operation}`;
    setError(errorMessage);
  }, []);

  // Generic loading wrapper
  const withLoading = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
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
    },
    [handleError],
  );

  // Get contract instance
  const getContract = useCallback(
    async (address: string, abi: any[], useSigner = false) => {
      const browserProvider = getBrowserProvider();
      const contractProvider = useSigner
        ? await browserProvider.getSigner()
        : browserProvider;
      return new ethers.Contract(address, abi, contractProvider);
    },
    [getBrowserProvider],
  );

  const getTokenConfidentialStatus = useCallback(
    async (
      tokenAddress: string,
    ): Promise<{ confidential: boolean; version?: 64 | 256 }> => {
      try {
        const browserProvider = getBrowserProvider();
        const code = await browserProvider.getCode(tokenAddress);

        if (code === '0x') {
          throw new Error('No contract deployed at this address');
        }

        const erc165 = new ethers.Contract(
          tokenAddress,
          ERC165_ABI,
          browserProvider,
        );
        let detectedVersion: 64 | 256 | undefined;
        let isConfidential = false;

        if (typeof erc165.supportsInterface === 'function') {
          try {
            const supports256 = await erc165.supportsInterface(
              PRIVATE_ERC20_256_INTERFACE_ID,
            );
            if (supports256) {
              detectedVersion = 256;
            }
            const supports64 = await erc165.supportsInterface(
              PRIVATE_ERC20_64_INTERFACE_ID,
            );
            if (supports64) {
              detectedVersion = 64;
            }
          } catch (error) {
            console.warn(
              '[getTokenConfidentialStatus] supportsInterface failed, falling back to selector scan',
              error,
            );
          }
        }

        try {
          const confidentialContract = new ethers.Contract(
            tokenAddress,
            PRIVATE_ERC20_ABI,
            browserProvider,
          );
          const accountEncryptionMethod =
            (confidentialContract as any).accountEncryptionAddress;
          if (accountEncryptionMethod) {
            await accountEncryptionMethod(tokenAddress);
            isConfidential = true;
          }
        } catch (error) {
          void error;
        }

        const selectorAccount = ethers
          .id('accountEncryptionAddress(address)')
          .slice(2);
        const selector64 = ethers
          .id('transfer(address,(uint256,bytes))')
          .slice(2);
        const selector256 = ethers
          .id('transfer(address,((uint256,uint256),bytes))')
          .slice(2);

        if (
          isConfidential ||
          code.includes(selectorAccount) ||
          code.includes(selector64) ||
          code.includes(selector256)
        ) {
          if (!detectedVersion) {
            if (code.includes(selector256)) {
              detectedVersion = 256;
            } else if (code.includes(selector64)) {
              detectedVersion = 64;
            }
          }

          if (!detectedVersion) {
            const probed = await probeConfidentialVersion256(
              tokenAddress,
              browserProvider,
            );
            if (probed) {
              detectedVersion = probed;
            }
          }

          return {
            confidential: true,
            ...(detectedVersion !== undefined
              ? { version: detectedVersion }
              : {}),
          };
        }

        return { confidential: false };
      } catch (error) {
        throw new Error(`Failed to analyze token: ${error}`);
      }
    },
    [getBrowserProvider],
  );

  // ERC20 Operations
  const transferERC20 = useCallback(
    async ({
      tokenAddress,
      to,
      amount,
      aesKey,
    }: TransferParams & { amount: string; aesKey?: string }) => {
      return withLoading(async () => {
        if (!amount) {
          throw new Error('Amount is required for ERC20 transfer');
        }
        if (!ethers.isAddress(to)) {
          throw new Error('Invalid recipient address');
        }

        const { confidential, version } =
          await getTokenConfidentialStatus(tokenAddress);
        const signer = await getBrowserProvider().getSigner();
        let tx;

        if (confidential) {
          if (!aesKey) {
            throw new Error('AES key is required for private ERC20 transfer');
          }
          signer.setAesKey(aesKey);
          const abi = version === 256 ? PRIVATE_ERC20_256_ABI : PRIVATE_ERC20_ABI;
          const selector =
            version === 256
              ? 'transfer(address,((uint256,uint256),bytes))'
              : 'transfer(address,(uint256,bytes))';
          const contract = new Contract(tokenAddress, abi, signer);
          let encryptedAmount = (await signer.encryptValue(
            ethers.toBigInt(amount),
            tokenAddress,
            getSelector(selector),
          )) as itUint;
          if (version === 256) {
            encryptedAmount = normalizeItUint256ForAbi(encryptedAmount);
          }
          tx = await (contract as any)[selector](to, encryptedAmount, {
            gasLimit: 12000000,
          });
        } else {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
          tx = await (contract as any)['transfer(address,uint256)'](
            to,
            ethers.toBigInt(amount),
            { gasLimit: 12000000 },
          );
        }

        if (!tx) {
          throw new Error('Transaction could not be initiated');
        }

        await tx.wait();
        return tx.hash ?? '';
      });
    },
    [withLoading, getBrowserProvider, getTokenConfidentialStatus],
  );

  const getERC20Details = useCallback(
    async (tokenAddress: string): Promise<TokenDetails> => {
      return withLoading(async () => {
        const { confidential, version } =
          await getTokenConfidentialStatus(tokenAddress);
        const abi = confidential
          ? version === 256
            ? PRIVATE_ERC20_256_ABI
            : PRIVATE_ERC20_ABI
          : ERC20_ABI;
        const contract = await getContract(tokenAddress, abi);
        const [name, symbol, decimals] = await Promise.all([
          (contract as any).name(),
          (contract as any).symbol(),
          (contract as any).decimals(),
        ]);

        if (!name || !symbol || decimals === undefined) {
          throw new Error('Could not retrieve contract details');
        }

        return { name, symbol, decimals };
      });
    },
    [withLoading, getContract],
  );

  const decryptERC20Balance = useCallback(
    async (tokenAddress: string, aesKey?: string, decimals?: number) => {
      return withLoading(async () => {
        const { confidential, version } =
          await getTokenConfidentialStatus(tokenAddress);
        const browserProvider = getBrowserProvider();
        const signer = await browserProvider.getSigner();
        const signerAddress = await signer.getAddress();

        if (confidential) {
          let confidentialVersion = version;
          if (confidentialVersion !== 256) {
            const probed = await probeConfidentialVersion256(
              tokenAddress,
              browserProvider,
              signerAddress,
            );
            if (probed) {
              confidentialVersion = probed;
            }
          }
          const abi =
            confidentialVersion === 256
              ? PRIVATE_ERC20_256_ABI
              : PRIVATE_ERC20_ABI;
          const tokenContract = new ethers.Contract(
            tokenAddress,
            abi,
            signer,
          );
          let tokenBalance = null;
          try {
            const balanceOfMethod = tokenContract['balanceOf(address)'];
            if (balanceOfMethod) {
              tokenBalance = await balanceOfMethod(signerAddress);
            }
          } catch (error) {
            tokenBalance = null;
          }

          if (tokenBalance && aesKey) {
            if (confidentialVersion === 256) {
              if (isZeroCtUint256(tokenBalance)) {
                return 0n;
              }
              const decryptedValue = decryptCtUint256(tokenBalance, aesKey);
              if (isInsaneDecryptedValue(decryptedValue, decimals)) {
                throw new Error(
                  'AES key mismatch: Decrypted value suspiciously high. Re-onboarding required.',
                );
              }
              return decryptedValue;
            }
            if (isZeroValue(tokenBalance)) {
              return 0n;
            }
            const decryptedRaw = decryptUint(tokenBalance, aesKey);
            const decryptedValue =
              typeof decryptedRaw === 'bigint'
                ? decryptedRaw
                : BigInt(decryptedRaw);
            if (isInsaneDecryptedValue(decryptedValue, decimals)) {
              throw new Error(
                'AES key mismatch: Decrypted value suspiciously high. Re-onboarding required.',
              );
            }
            return decryptedValue;
          } else if (tokenBalance && !aesKey) {
            if (confidentialVersion === 256) {
              return 0n;
            }
            return BigInt(tokenBalance.toString());
          }
          return 0n;
        }
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          browserProvider,
        );
        let tokenBalance = null;
        try {
          const balanceOfMethod = tokenContract['balanceOf(address)'];
          if (balanceOfMethod) {
            tokenBalance = await balanceOfMethod(signerAddress);
          }
        } catch (error) {
          tokenBalance = null;
        }
        return tokenBalance ? BigInt(tokenBalance.toString()) : 0n;
      });
    },
    [withLoading, getBrowserProvider, getTokenConfidentialStatus],
  );

  const getNFTConfidentialStatus = useCallback(
    async (tokenAddress: string): Promise<boolean> => {
      try {
        const browserProvider = getBrowserProvider();
        const code = await browserProvider.getCode(tokenAddress);

        if (code === '0x') {
          throw new Error('No contract deployed at this address');
        }

        const confidentialInterface = new ethers.Interface(PRIVATE_ERC721_ABI);
        const mintFragment = confidentialInterface.getFunction('mint');
        const confidentialMintSelector = mintFragment?.selector ?? '';

        if (
          confidentialMintSelector &&
          code.includes(confidentialMintSelector.slice(2))
        ) {
          return true;
        }
        return false;
      } catch (error) {
        console.error('[getNFTConfidentialStatus] Error:', error);
        throw new Error(`Failed to analyze NFT: ${error}`);
      }
    },
    [getBrowserProvider],
  );

  const getERC721TokenURI = useCallback(
    async (
      tokenAddress: string,
      tokenId: string,
      aesKey?: string,
    ): Promise<string | null> => {
      if (aesKey) {
        try {
          const contract = await getContract(tokenAddress, PRIVATE_ERC721_ABI);
          const result = await (contract as any).tokenURI(tokenId);
          const decryptedURI = decryptString(result, aesKey);
          const cleanURI = decryptedURI?.replace(/\0/g, '').trim();
          if (cleanURI) {
            return cleanURI;
          }
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
        throw new Error(
          `Failed to fetch token URI: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [getContract],
  );

  const getERC1155TokenURI = useCallback(
    async (tokenAddress: string, tokenId: string): Promise<string | null> => {
      try {
        const contract = await getContract(tokenAddress, ERC1155_ABI);
        const result = await (contract as any).uri(tokenId);
        const uri = decodePotentialString(result);
        return uri || null;
      } catch (error) {
        throw new Error(
          `Failed to fetch token URI: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [getContract],
  );

  const transferERC721 = useCallback(
    async ({
      tokenAddress,
      to,
      tokenId,
    }: TransferParams & { tokenId: string }) => {
      return withLoading(async () => {
        if (!tokenId) {
          throw new Error('Token ID is required for ERC721 transfer');
        }

        const isConfidential = await getNFTConfidentialStatus(tokenAddress);
        const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
        const contract = await getContract(tokenAddress, abi, true);
        const signer = await getBrowserProvider().getSigner();
        const fromAddress = await signer.getAddress();
        const tx = await (contract as any).transferFrom(
          fromAddress,
          to,
          tokenId,
        );

        if (!tx) {
          throw new Error('Transaction could not be initiated');
        }
        await tx.wait();
        const nftKey = `${tokenAddress.toLowerCase()}-${tokenId.toLowerCase()}`;
        removeImportedToken(nftKey);
        removeImportedTokenByAccount(fromAddress, nftKey);
        notifyImportedTokensUpdated();
        return tx.hash ?? '';
      });
    },
    [withLoading, getContract, getBrowserProvider, getNFTConfidentialStatus],
  );

  const getERC721Balance = useCallback(
    async (tokenAddress: string, account: string): Promise<string> => {
      return withLoading(async () => {
        const isConfidential = await getNFTConfidentialStatus(tokenAddress);
        const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
        const contract = await getContract(tokenAddress, abi);
        const balance = await (contract as any).balanceOf(account);

        if (!balance) {
          throw new Error('Could not retrieve balance');
        }
        return balance.toString();
      });
    },
    [withLoading, getContract, getNFTConfidentialStatus],
  );

  const getERC721Details = useCallback(
    async (tokenAddress: string): Promise<TokenDetails> => {
      return withLoading(async () => {
        const isConfidential = await getNFTConfidentialStatus(tokenAddress);
        const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
        const contract = await getContract(tokenAddress, abi);
        const [name, symbol] = await Promise.all([
          (contract as any).name(),
          (contract as any).symbol(),
        ]);

        if (!name || !symbol) {
          throw new Error('Could not retrieve contract details');
        }
        return { name, symbol };
      });
    },
    [withLoading, getContract, getNFTConfidentialStatus],
  );

  const getERC721Owner = useCallback(
    async (tokenAddress: string, tokenId: string): Promise<string> => {
      try {
        const isConfidential = await getNFTConfidentialStatus(tokenAddress);
        const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;
        const contract = await getContract(tokenAddress, abi);
        const owner = await (contract as any).ownerOf(tokenId);
        if (!owner) {
          throw new Error('Could not retrieve owner');
        }
        return owner.toString();
      } catch (error) {
        throw new Error(
          `Failed to fetch owner: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [getContract, getNFTConfidentialStatus],
  );

  // ERC1155 Operations
  const transferERC1155 = useCallback(
    async ({
      tokenAddress,
      to,
      tokenId,
      amount,
    }: TransferParams & { tokenId: string; amount: string }) => {
      return withLoading(async () => {
        if (!tokenId || !amount) {
          throw new Error(
            'Token ID and amount are required for ERC1155 transfer',
          );
        }
        if (!ethers.isAddress(to)) {
          throw new Error('Invalid recipient address');
        }
        const signer = await getBrowserProvider().getSigner();
        const contract = new ethers.Contract(tokenAddress, ERC1155_ABI, signer);
        const fromAddress = await signer.getAddress();
        const tx = await (contract as any).safeTransferFrom(
          fromAddress,
          to,
          tokenId,
          amount,
          '0x',
          { gasLimit: 12000000 },
        );
        if (!tx) {
          throw new Error('Transaction could not be initiated');
        }
        await tx.wait();
        return tx.hash ?? '';
      });
    },
    [withLoading, getBrowserProvider],
  );

  const getERC1155Balance = useCallback(
    async (
      tokenAddress: string,
      account: string,
      tokenId: string,
    ): Promise<string> => {
      return withLoading(async () => {
        const contract = await getContract(tokenAddress, ERC1155_ABI);
        const balance = await (contract as any).balanceOf(account, tokenId);
        if (!balance) {
          throw new Error('Could not retrieve balance');
        }
        return balance.toString();
      });
    },
    [withLoading, getContract],
  );

  const getERC1155Details = useCallback(
    async (
      tokenAddress: string,
      tokenId: string,
    ): Promise<ERC1155TokenDetails> => {
      return withLoading(async () => {
        const uri = await getERC1155TokenURI(tokenAddress, tokenId);

        if (!uri) {
          throw new Error('Could not retrieve token URI');
        }
        return { uri };
      });
    },
    [withLoading, getERC1155TokenURI],
  );

  const getNFTMetadata = useCallback(
    async ({
      tokenAddress,
      tokenId,
      tokenType,
      aesKey,
    }: {
      tokenAddress: string;
      tokenId: string;
      tokenType?: TokenType;
      aesKey?: string;
    }): Promise<NFTMetadataResult | null> => {
      if (!tokenAddress || !tokenId) {
        return null;
      }

      try {
        const rawUri =
          tokenType === 'ERC1155'
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
          image: result.image,
        };
      } catch (error) {
        console.error('[NFT Metadata] Error:', error);
        throw new Error(
          `Failed to fetch NFT metadata: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    [getERC1155TokenURI, getERC721TokenURI],
  );

  // COTI/Ether Operations
  const transferCOTI = useCallback(
    async ({ to, amount }: { to: string; amount: string }) => {
      return withLoading(async () => {
        const signer = await getBrowserProvider().getSigner();
        const tx = await signer.sendTransaction({
          to,
          value: ethers.parseEther(amount),
        });

        if (!tx) {
          throw new Error('Transaction could not be initiated');
        }
        await tx.wait();
        return tx.hash ?? '';
      });
    },
    [withLoading, getBrowserProvider],
  );

  const getTokenInfo = useCallback(
    async (address: string): Promise<TokenInfo> => {
      return withLoading(async () => {
        try {
          const provider = getBrowserProvider();
          const code = await provider.getCode(address);
          if (code === '0x') {
            throw new Error(
              'This address does not contain a smart contract. Please verify the token contract address.',
            );
          }

          const { confidential, version } =
            await getTokenConfidentialStatus(address);
          const abi = confidential
            ? version === 256
              ? PRIVATE_ERC20_256_ABI
              : PRIVATE_ERC20_ABI
            : ERC20_ABI;
          const contract = new ethers.Contract(address, abi, provider);

          if (!contract.name || !contract.symbol || !contract.decimals) {
            throw new Error(
              'Contract does not implement required ERC20 methods',
            );
          }

          const name = await contract.name();
          const symbol = await contract.symbol();
          const decimals = await contract.decimals();

          if (!name || !symbol || decimals === undefined || decimals === null) {
            throw new Error(
              'Invalid token contract: missing required token information',
            );
          }

          return { address, name, symbol, decimals };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('could not decode result data')
          ) {
            throw new Error(
              'This contract address does not appear to be a valid ERC20 token. Please verify the address is correct.',
            );
          }
          throw error;
        }
      });
    },
    [withLoading, getBrowserProvider, getTokenConfidentialStatus],
  );

  // NFT Information
  const getNFTInfo = useCallback(
    async (address: string): Promise<NFTInfo> => {
      return withLoading(async () => {
        const isConfidential = await getNFTConfidentialStatus(address);
        const abi = isConfidential ? PRIVATE_ERC721_ABI : ERC721_ABI;

        try {
          const contract = (await getContract(
            address,
            abi,
            true,
          )) as unknown as IERC721;
          const [name, symbol] = await Promise.all([
            contract.name(),
            contract.symbol(),
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
            const fallbackContract = (await getContract(
              address,
              fallbackAbi,
              true,
            )) as unknown as IERC721;
            const [name, symbol] = await Promise.all([
              fallbackContract.name(),
              fallbackContract.symbol(),
            ]);

            const cleanName = name?.trim() || '';
            const cleanSymbol = symbol?.trim() || '';

            if (!cleanName || !cleanSymbol) {
              throw new Error('Invalid NFT contract');
            }

            return { address, name: cleanName, symbol: cleanSymbol };
          } catch (fallbackError) {
            throw new Error(
              'Invalid NFT contract - unable to read name and symbol',
            );
          }
        }
      });
    },
    [withLoading, getContract, getNFTConfidentialStatus],
  );

  // MetaMask Integration
  const addTokenToMetaMask = useCallback(
    async ({ address, symbol, decimals, image }: ImportTokenParams) => {
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
    },
    [],
  );

  const addNFTToMetaMask = useCallback(
    async ({
      address,
      symbol,
      decimals,
      image,
      tokenId,
    }: ImportTokenParams & { tokenId: string }) => {
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
    },
    [],
  );

  const addERC1155ToMetaMask = useCallback(
    async ({
      address,
      symbol,
      decimals,
      image,
      tokenId,
    }: ImportTokenParams & { tokenId: string }) => {
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
    },
    [],
  );

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
