import type { ctUint } from '@coti-io/coti-sdk-typescript';
import * as CotiSDK from '@coti-io/coti-sdk-typescript';
import { Contract, ethers, formatUnits, ZeroAddress } from 'ethers';

import {
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
  getExpectedEnvironment,
  setExpectedEnvironment,
} from './snap';
import {
  COTI_MAINNET_CHAIN_ID,
  COTI_TESTNET_CHAIN_ID,
  setEnvironment,
} from '../config';
import erc20Abi from '../abis/ERC20.json';
import erc20ConfidentialAbi from '../abis/ERC20Confidential.json';
import erc20Confidential256Abi from '../abis/ERC20Confidential256.json';
import erc721Abi from '../abis/ERC721.json';
import erc721ConfidentialAbi from '../abis/ERC721Confidential.json';
import type { Tokens } from '../types';
import { TokenViewSelector } from '../types';

const { decryptUint, decryptString } = CotiSDK;
const decryptUint256 = (CotiSDK as { decryptUint256?: unknown }).decryptUint256 as
  | ((ciphertext: unknown, userKey: string) => bigint)
  | undefined;

const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
];

const PRIVATE_ERC20_64_INTERFACE_ID = '0x8409a9cf';
const PRIVATE_ERC20_256_INTERFACE_ID = '0xdfeb393e';

// ERC721 and ERC1155 detection uses ERC165:
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

const resolveEnvironment = async (): Promise<'testnet' | 'mainnet'> => {
  const expectedEnv = await getExpectedEnvironment();

  try {
    const chainIdHex = (await ethereum.request({
      method: 'eth_chainId',
    })) as string;
    const currentChainId = parseInt(chainIdHex, 16).toString();

    if (currentChainId === COTI_TESTNET_CHAIN_ID) {
      setEnvironment('testnet');
      if (expectedEnv !== 'testnet') {
        await setExpectedEnvironment('testnet');
      }
      return 'testnet';
    }

    if (currentChainId === COTI_MAINNET_CHAIN_ID) {
      setEnvironment('mainnet');
      if (expectedEnv !== 'mainnet') {
        await setExpectedEnvironment('mainnet');
      }
      return 'mainnet';
    }
  } catch (error) {
    void error;
  }

  if (expectedEnv) {
    setEnvironment(expectedEnv);
    return expectedEnv;
  }

  setEnvironment('mainnet');
  return 'mainnet';
};

const getJsonRpcProvider = async () => {
  const environment = await resolveEnvironment();
  const rpcUrl =
    environment === 'testnet'
      ? 'https://testnet.coti.io/rpc'
      : 'https://mainnet.coti.io/rpc';
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getTokenURI = async (
  address: string,
  tokenId: string,
  aesKey: string,
): Promise<string | null> => {
  try {
    const provider = await getJsonRpcProvider();
    const contract = new ethers.Contract(
      address,
      erc721ConfidentialAbi,
      provider,
    );
    const tokenURIMethod = contract.tokenURI;
    if (!tokenURIMethod) {
      throw new Error('tokenURI method not available');
    }
    const encryptedTokenURI = await tokenURIMethod(BigInt(tokenId));
    const decryptedURI = decryptString(encryptedTokenURI, aesKey)
      .replace(/\0/g, '')
      .trim();
    if (!decryptedURI) {
      return null;
    }
    return decryptedURI;
  } catch (error) {
    void error;
    return null;
  }
};

export const getPublicTokenURI = async (
  address: string,
  tokenId: string,
): Promise<string | null> => {
  try {
    const provider = await getJsonRpcProvider();
    const contract = new ethers.Contract(
      address,
      ['function tokenURI(uint256) view returns (string)'],
      provider,
    );
    const uri = await contract.getFunction('tokenURI')(BigInt(tokenId));
    return uri || null;
  } catch (error) {
    void error;
    return null;
  }
};

export const getERC20Details = async (
  address: string,
  // aesKey: string,
): Promise<{
  decimals: string | null;
  symbol: string | null;
  name: string | null;
} | null> => {
  try {
    const provider = await getJsonRpcProvider();
    const contract = new ethers.Contract(address, erc20Abi, provider);

    if (!contract.decimals || !contract.symbol || !contract.name) {
      throw new Error('Required ERC20 methods not available');
    }
    const [_decimals, symbol, name] = await Promise.all([
      contract.decimals(),
      contract.symbol(),
      contract.name(),
    ]);

    const decimals = _decimals.toString();
    return { decimals, symbol, name };
  } catch (error) {
    void error;
    return null;
  }
};
export const getERC721Details = async (
  address: string,
  // aesKey: string,
): Promise<{
  symbol: string | null;
  name: string | null;
} | null> => {
  try {
    const provider = await getJsonRpcProvider();
    const contract = new ethers.Contract(address, erc721Abi, provider);

    if (!contract.symbol || !contract.name) {
      throw new Error('Required ERC721 methods not available');
    }
    const [symbol, name] = await Promise.all([
      contract.symbol(),
      contract.name(),
    ]);

    return { symbol, name };
  } catch (error) {
    void error;
    return null;
  }
};

/**
 * Checks if the current user owns a specific ERC721 token
 * @param address - The contract address of the ERC721 token
 * @param tokenId - The token ID to check
 * @returns Promise<boolean> - true if user owns the token, false otherwise
 */
export const checkERC721Ownership = async (
  address: string,
  tokenId: string,
): Promise<boolean> => {
  try {
    const provider = await getJsonRpcProvider();

    const accounts = (await ethereum.request({
      method: 'eth_accounts',
    })) as string[];
    const userAddress = accounts.length > 0 ? accounts[0] : null;

    if (!userAddress) {
      throw new Error('No account connected');
    }

    let contract = new ethers.Contract(address, erc721Abi, provider);

    try {
      if (!contract.ownerOf) {
        throw new Error('ownerOf method not available');
      }

      const owner = await contract.ownerOf(BigInt(tokenId));
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      void error;
      try {
        contract = new ethers.Contract(
          address,
          erc721ConfidentialAbi,
          provider,
        );

        if (!contract.ownerOf) {
          throw new Error(
            'ownerOf method not available in confidential contract',
          );
        }

        const owner = await contract.ownerOf(BigInt(tokenId));
        return owner.toLowerCase() === userAddress.toLowerCase();
      } catch (error2) {
        void error2;
        return false;
      }
    }
  } catch (error) {
    void error;
    return false;
  }
};

/**
 * Determines the type of token (ERC-20, ConfidentialERC20, or NFT) for a given contract address.
 * @param address - The contract address of the token.
 * @returns An object containing the token type and whether it is confidential.
 */
export async function getTokenType(address: string): Promise<{
  type: TokenViewSelector;
  confidential: boolean;
  confidentialVersion?: 64 | 256;
}> {
  const provider = await getJsonRpcProvider();
  const erc165Contract = new ethers.Contract(address, ERC165_ABI, provider);

  let isERC721 = false;
  let isERC1155 = false;

  if (erc165Contract.supportsInterface) {
    try {
      isERC721 = await erc165Contract.supportsInterface(ERC721_INTERFACE_ID);
    } catch {
      // ERC721 interface check failed - expected for non-ERC721 contracts
      isERC721 = false;
    }

    if (!isERC721) {
      try {
        isERC1155 =
          await erc165Contract.supportsInterface(ERC1155_INTERFACE_ID);
      } catch {
        // ERC1155 interface check failed - expected for non-ERC1155 contracts
        isERC1155 = false;
      }
    }
  }

  if (isERC721 || isERC1155) {
    try {
      const contract = new ethers.Contract(
        address,
        erc721ConfidentialAbi,
        provider,
      );
      const tokenURIMethod = contract.tokenURI;
      if (!tokenURIMethod) {
        throw new Error('tokenURI method not available');
      }
      const tokenURI = await tokenURIMethod(BigInt(0));
      if (tokenURI) {
        return { type: TokenViewSelector.NFT, confidential: true };
      }
      return { type: TokenViewSelector.NFT, confidential: false };
    } catch (error) {
      void error;
      return { type: TokenViewSelector.NFT, confidential: false };
    }
  }

  const getPrivateErc20Version = async (): Promise<64 | 256 | undefined> => {
    if (typeof erc165Contract.supportsInterface !== 'function') {
      return undefined;
    }
    try {
      const supports256 = await erc165Contract.supportsInterface(
        PRIVATE_ERC20_256_INTERFACE_ID,
      );
      if (supports256) {
        return 256;
      }
      const supports64 = await erc165Contract.supportsInterface(
        PRIVATE_ERC20_64_INTERFACE_ID,
      );
      if (supports64) {
        return 64;
      }
    } catch (error) {
      void error;
    }

    try {
      const code = await provider.getCode(address);
      if (code && code !== '0x') {
        const selector256 = ethers
          .id('transfer(address,((uint256,uint256),bytes))')
          .slice(2);
        if (code.includes(selector256)) {
          return 256;
        }
        const selector64 = ethers
          .id('transfer(address,(uint256,bytes))')
          .slice(2);
        if (code.includes(selector64)) {
          return 64;
        }
      }
    } catch (error) {
      void error;
      return undefined;
    }

    return undefined;
  };

  // likely fungible (ERC-20 or ConfidentialERC20).
  const erc20Contract = new ethers.Contract(address, erc20Abi, provider);

  try {
    if (
      !erc20Contract.decimals ||
      !erc20Contract.symbol ||
      !erc20Contract.totalSupply ||
      !erc20Contract.balanceOf
    ) {
      throw new Error('Required ERC20 methods not available');
    }
    await erc20Contract.decimals();
    await erc20Contract.symbol();
    await erc20Contract.totalSupply();
    const balanceOfMethod =
      (erc20Contract as any)['balanceOf(address)'] ??
      (erc20Contract as any).balanceOf;
    if (!balanceOfMethod) {
      throw new Error('Required ERC20 methods not available');
    }
    await balanceOfMethod(ZeroAddress);

    try {
      const erc20ConfidentialContract = new ethers.Contract(
        address,
        erc20ConfidentialAbi,
        provider,
      );
      const accountEncryptionMethod =
        erc20ConfidentialContract.accountEncryptionAddress;
      if (!accountEncryptionMethod) {
        throw new Error('accountEncryptionAddress method not available');
      }
      await accountEncryptionMethod(address);
      let confidentialVersion = await getPrivateErc20Version();
      if (confidentialVersion === undefined) {
        const probed = await probeConfidentialVersion256(address, provider);
        if (probed) {
          confidentialVersion = probed;
        }
      }
      return {
        type: TokenViewSelector.ERC20,
        confidential: true,
        ...(confidentialVersion !== undefined
          ? { confidentialVersion }
          : {}),
      };
    } catch (error) {
      void error;
      // Confidential ERC20 check failed - token is standard ERC20
      return { type: TokenViewSelector.ERC20, confidential: false };
    }
  } catch (error) {
    void error;
    // Standard ERC20 check failed - token type unknown
    return { type: TokenViewSelector.UNKNOWN, confidential: false };
  }
}

type CtUint256 =
  | {
      ciphertextHigh: bigint;
      ciphertextLow: bigint;
    }
  | {
      high: { high: bigint; low: bigint };
      low: { high: bigint; low: bigint };
    };

const INSANE_BALANCE_BASE = 1000000000000n;

const normalizeDecimals = (
  decimals?: string | number | null,
): number => {
  if (decimals === undefined || decimals === null) {
    return 18;
  }
  const parsed =
    typeof decimals === 'string' ? parseInt(decimals, 10) : decimals;
  if (!Number.isFinite(parsed)) {
    return 18;
  }
  if (parsed < 0) {
    return 0;
  }
  if (parsed > 36) {
    return 36;
  }
  return Math.floor(parsed);
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

const isInsaneDecryptedValue = (
  value: bigint,
  decimals?: string | number | null,
): boolean => {
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
  address: string,
  provider: ethers.AbstractProvider,
  accountAddress?: string,
): Promise<256 | undefined> => {
  try {
    const contract = new ethers.Contract(
      address,
      erc20Confidential256Abi,
      provider,
    );
    const targetAddress =
      accountAddress && ethers.isAddress(accountAddress)
        ? accountAddress
        : ZeroAddress;
    const balanceOfMethod =
      (contract as any)['balanceOf(address)'] ?? (contract as any).balanceOf;
    if (!balanceOfMethod) {
      return undefined;
    }
    const balance = await balanceOfMethod(targetAddress);
    if (isCtUint256Shape(balance)) {
      return 256;
    }
  } catch (error) {
    void error;
  }
  return undefined;
};

export const decryptBalance = (
  balance: ctUint | CtUint256,
  aesKey: string,
  variant: 64 | 256 = 64,
  decimals?: string | number | null,
): bigint | null => {
  try {
    if (variant === 256) {
      const nested = balance as {
        high?: { high?: bigint; low?: bigint };
        low?: { high?: bigint; low?: bigint };
      };
      if (
        nested?.high?.high !== undefined &&
        nested?.high?.low !== undefined &&
        nested?.low?.high !== undefined &&
        nested?.low?.low !== undefined
      ) {
        if (isZeroCtUint256(balance)) {
          return 0n;
        }
        const d1 = decryptUint(nested.high.high, aesKey);
        const d2 = decryptUint(nested.high.low, aesKey);
        const d3 = decryptUint(nested.low.high, aesKey);
        const d4 = decryptUint(nested.low.low, aesKey);
        const decrypted = (d1 << 192n) + (d2 << 128n) + (d3 << 64n) + d4;
        if (isInsaneDecryptedValue(decrypted, decimals)) {
          return null;
        }
        return decrypted;
      }

      if (decryptUint256) {
        if (isZeroCtUint256(balance)) {
          return 0n;
        }
        const decrypted = decryptUint256(balance, aesKey);
        if (isInsaneDecryptedValue(decrypted, decimals)) {
          return null;
        }
        return decrypted;
      }
      return null;
    }
    if (isZeroValue(balance)) {
      return 0n;
    }
    const rawDecrypted = decryptUint(balance as ctUint, aesKey);
    const decrypted =
      typeof rawDecrypted === 'bigint' ? rawDecrypted : BigInt(rawDecrypted);
    if (isInsaneDecryptedValue(decrypted, decimals)) {
      return null;
    }
    return decrypted;
  } catch (error) {
    void error;
    return null;
  }
};

export const checkChainId = async (): Promise<boolean> => {
  try {
    const { COTI_TESTNET_CHAIN_ID, COTI_MAINNET_CHAIN_ID, setEnvironment } =
      await import('../config');

    const expectedEnv = await getExpectedEnvironment();

    if (expectedEnv) {
      try {
        const chainIdHex = (await ethereum.request({
          method: 'eth_chainId',
        })) as string;
        const currentChainId = parseInt(chainIdHex, 16).toString();

        if (currentChainId === COTI_TESTNET_CHAIN_ID) {
          if (expectedEnv !== 'testnet') {
            setEnvironment('testnet');
            await setExpectedEnvironment('testnet');
          } else {
            setEnvironment(expectedEnv);
          }
          return true;
        }

        if (currentChainId === COTI_MAINNET_CHAIN_ID) {
          if (expectedEnv !== 'mainnet') {
            setEnvironment('mainnet');
            await setExpectedEnvironment('mainnet');
          } else {
            setEnvironment(expectedEnv);
          }
          return true;
        }

        return false;
      } catch (error) {
        void error;
        setEnvironment(expectedEnv);
        return true;
      }
    }

    const chainIdHex = (await ethereum.request({
      method: 'eth_chainId',
    })) as string;
    const currentChainId = parseInt(chainIdHex, 16).toString();

    if (currentChainId === COTI_TESTNET_CHAIN_ID) {
      setEnvironment('testnet');
      await setExpectedEnvironment('testnet');
      return true;
    }

    if (currentChainId === COTI_MAINNET_CHAIN_ID) {
      setEnvironment('mainnet');
      await setExpectedEnvironment('mainnet');
      return true;
    }

    return false;
  } catch (error) {
    void error;
    const expectedEnv = await getExpectedEnvironment();
    if (expectedEnv) {
      const { setEnvironment } = await import('../config');
      setEnvironment(expectedEnv);
      return true;
    }
    return false;
  }
};

export const checkIfERC20Unique = async (address: string): Promise<boolean> => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
};

export const checkIfERC721Unique = async (
  address: string,
  tokenId: string,
): Promise<boolean> => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some(
    (token) =>
      token.address.toLowerCase() === address.toLowerCase() &&
      token.tokenId === tokenId,
  );
};

export const recalculateBalances = async (): Promise<{
  balance: bigint;
  tokenBalances: Tokens;
}> => {
  // IMPORTANT: BrowserProvider(ethereum) does NOT sync when MetaMask changes networks
  // So we must use JsonRpcProvider with the correct RPC URL based on the current chain.
  const environment = await resolveEnvironment();
  const rpcUrl =
    environment === 'testnet'
      ? 'https://testnet.coti.io/rpc'
      : 'https://mainnet.coti.io/rpc';

  const state = await getStateByChainIdAndAddress(undefined, true);
  const tokens = state.tokenBalances || [];

  // Use JsonRpcProvider with direct RPC URL instead of BrowserProvider
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    let accounts = (await ethereum.request({
      method: 'eth_accounts',
    })) as string[];
    if (!accounts.length) {
      try {
        accounts = (await ethereum.request({
          method: 'eth_requestAccounts',
        })) as string[];
      } catch (error) {
        void error;
      }
    }
    const signerAddress = accounts.length > 0 ? accounts[0] : null;

    if (!signerAddress) {
      throw new Error('No account connected');
    }

    const balance = await provider.getBalance(signerAddress);

    const tokenBalances: Tokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          if (token.type === TokenViewSelector.ERC20) {
            let tokenConfidential = token.confidential;
            let tokenConfidentialVersion = token.confidentialVersion;

            if (!tokenConfidential || tokenConfidentialVersion === undefined) {
              try {
                const detected = await getTokenType(token.address);
                if (detected.type === TokenViewSelector.ERC20) {
                  tokenConfidential = detected.confidential;
                  if (detected.confidentialVersion) {
                    tokenConfidentialVersion = detected.confidentialVersion;
                  }
                }
              } catch (error) {
                void error;
              }
            }

            let confidentialVersion = tokenConfidentialVersion ?? 64;
            if (tokenConfidential && confidentialVersion === 64) {
              try {
                const probed = await probeConfidentialVersion256(
                  token.address,
                  provider,
                  signerAddress,
                );
                if (probed) {
                  confidentialVersion = probed;
                }
              } catch (error) {
                void error;
              }
            }

            const callBalance = async (abi: any) => {
              const tokenContract = new Contract(token.address, abi, provider);
              const balanceOfMethod =
                (tokenContract as any)['balanceOf(address)'] ??
                (tokenContract as any).balanceOf;
              if (!balanceOfMethod) {
                throw new Error('balanceOf not available');
              }
              return balanceOfMethod(signerAddress);
            };

            let tokenBalance: ctUint | CtUint256 | bigint | string | null = null;
            let resolvedConfidential = tokenConfidential;
            let resolvedVersion = confidentialVersion;

            try {
              const erc20ReadAbi =
                tokenConfidential && confidentialVersion === 256
                  ? erc20Confidential256Abi
                  : tokenConfidential
                    ? erc20ConfidentialAbi
                    : erc20Abi;
              tokenBalance = await callBalance(erc20ReadAbi);
            } catch (error) {
              if (tokenConfidential) {
                try {
                  const fallbackAbi =
                    confidentialVersion === 256
                      ? erc20ConfidentialAbi
                      : erc20Confidential256Abi;
                  tokenBalance = await callBalance(fallbackAbi);
                  resolvedVersion = confidentialVersion === 256 ? 64 : 256;
                } catch (fallbackError) {
                  void fallbackError;
                }
              } else {
                try {
                  tokenBalance = await callBalance(erc20ConfidentialAbi);
                  resolvedConfidential = true;
                  resolvedVersion = 64;
                } catch (fallbackError) {
                  void fallbackError;
                }
                if (tokenBalance === null) {
                  try {
                    tokenBalance = await callBalance(
                      erc20Confidential256Abi,
                    );
                    resolvedConfidential = true;
                    resolvedVersion = 256;
                  } catch (fallbackError) {
                    void fallbackError;
                  }
                }
              }
            }

            if (
              resolvedConfidential &&
              tokenBalance !== null &&
              tokenBalance !== undefined &&
              state.aesKey
            ) {
              const decrypted = decryptBalance(
                tokenBalance as ctUint | CtUint256,
                state.aesKey,
                resolvedVersion ?? 64,
                token.decimals,
              );
              tokenBalance = decrypted;
            } else if (resolvedConfidential && !state.aesKey) {
              tokenBalance = null;
            }

            return {
              ...token,
              confidential: resolvedConfidential,
              ...(resolvedConfidential
                ? { confidentialVersion: resolvedVersion }
                : tokenConfidentialVersion !== undefined
                  ? { confidentialVersion: tokenConfidentialVersion }
                  : {}),
              balance:
                tokenBalance !== null && tokenBalance !== undefined
                  ? tokenBalance.toString()
                  : null,
            };
          }

          if (token.type === TokenViewSelector.NFT) {
            // Use provider instead of signer for read-only operations
            const tokenContract = new Contract(
              token.address,
              erc721ConfidentialAbi,
              provider,
            );
            const balanceOfMethod =
              (tokenContract as any)['balanceOf(address)'] ??
              (tokenContract as any).balanceOf;
            const tokenBalance = balanceOfMethod
              ? await balanceOfMethod(signerAddress)
              : null;
            let tokenUri: string | null = token.uri ?? null;
            if (token.confidential && token.tokenId && state.aesKey) {
              tokenUri =
                (await getTokenURI(
                  token.address,
                  token.tokenId,
                  state.aesKey,
                )) ?? tokenUri;
            } else if (!token.confidential && token.tokenId) {
              tokenUri =
                (await getPublicTokenURI(token.address, token.tokenId)) ??
                tokenUri;
            }
            return {
              ...token,
              balance: tokenBalance?.toString() ?? null,
              uri: tokenUri,
            };
          }
          return { ...token, balance: null };
        } catch (tokenError) {
          void tokenError;
          return { ...token, balance: null };
        }
      }),
    );

    await setStateByChainIdAndAddress({
      ...state,
      balance: balance.toString(),
      tokenBalances,
    });
    return { balance, tokenBalances };
  } catch (error) {
    void error;
    const fallbackBalance =
      state.balance && state.balance !== '0'
        ? BigInt(state.balance)
        : BigInt(0);
    return {
      balance: fallbackBalance,
      tokenBalances: tokens.map((token) => ({
        ...token,
        balance: token.balance ?? null,
      })),
    };
  }
};

export const importToken = async (
  address: string,
  name: string,
  symbol: string,
  decimals: string,
  tokenId?: string,
  knownTokenType?: 'ERC20' | 'ERC721' | 'ERC1155',
): Promise<void> => {
  const normalizedAddress = address.toLowerCase();
  const oldState = await getStateByChainIdAndAddress();
  const tokens = oldState.tokenBalances || [];

  const alreadyExists = tokenId
    ? tokens.some(
        (t) =>
          t.address.toLowerCase() === normalizedAddress &&
          t.tokenId === tokenId,
      )
    : tokens.some((t) => t.address.toLowerCase() === normalizedAddress);
  if (alreadyExists) {
    throw new Error('Token already exists');
  }

  let type: TokenViewSelector;
  let confidential = false;
  let confidentialVersion: 64 | 256 | undefined;

  if (knownTokenType) {
    type =
      knownTokenType === 'ERC20'
        ? TokenViewSelector.ERC20
        : TokenViewSelector.NFT;
    try {
      const detected = await getTokenType(address);
      confidential = detected.confidential;
      confidentialVersion = detected.confidentialVersion;
    } catch (error) {
      void error;
    }
  } else {
    const detected = await getTokenType(address);
    if (detected.type === TokenViewSelector.UNKNOWN) {
      throw new Error('Invalid token type');
    }
    type = detected.type;
    confidential = detected.confidential;
    confidentialVersion = detected.confidentialVersion;
  }

  if (type === TokenViewSelector.NFT && !tokenId) {
    throw new Error('Token ID required for NFT');
  }
  tokens.push({
    address,
    name,
    symbol,
    balance: null,
    type,
    confidential,
    ...(confidentialVersion !== undefined
      ? { confidentialVersion }
      : {}),
    decimals,
    tokenId: tokenId ?? null,
  });
  await setStateByChainIdAndAddress({ ...oldState, tokenBalances: tokens });
};

export const hideToken = async (
  address: string,
  tokenId?: string,
): Promise<void> => {
  const oldState = await getStateByChainIdAndAddress();
  const tokens = oldState.tokenBalances;
  const updatedTokens = tokens.filter((token) => {
    if (tokenId) {
      return !(
        token.address.toLowerCase() === address.toLowerCase() &&
        token.tokenId === tokenId
      );
    }
    return token.address.toLowerCase() !== address.toLowerCase();
  });
  await setStateByChainIdAndAddress({
    ...oldState,
    tokenBalances: updatedTokens,
  });
};

export const truncateAddress = (address: string, length = 6): string => {
  if (address.length <= length * 2) {
    return address;
  }
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * Formats a token balance from wei format to human-readable format
 * @param balance - The token balance in wei format (as string)
 * @param decimals - The number of decimals for the token
 * @param maxDecimals - Maximum number of decimal places to show (default: 4)
 * @returns Formatted balance string
 */
export const formatTokenBalance = (
  balance: string | null,
  decimals: string | null,
  maxDecimals = 4,
): string => {
  if (!balance || balance === '0' || !decimals) {
    return '0';
  }

  try {
    const formatted = formatUnits(balance, parseInt(decimals, 10));
    const dotIndex = formatted.indexOf('.');

    if (dotIndex === -1) {
      return formatted;
    }

    return formatted.slice(0, dotIndex + maxDecimals + 1);
  } catch (error) {
    void error;
    return '0';
  }
};
