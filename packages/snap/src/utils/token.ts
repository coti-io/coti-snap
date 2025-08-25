import type { ctUint } from '@coti-io/coti-sdk-typescript';
import { decryptUint, decryptString } from '@coti-io/coti-sdk-typescript';
import { BrowserProvider, Contract, ethers, formatUnits, ZeroAddress } from 'ethers';

import erc20Abi from '../abis/ERC20.json';
import erc20ConfidentialAbi from '../abis/ERC20Confidential.json';
import erc721Abi from '../abis/ERC721.json';
import erc721ConfidentialAbi from '../abis/ERC721Confidential.json';
import { getCurrentNetworkConfig } from '../config';
import type { Tokens } from '../types';
import { TokenViewSelector } from '../types';
import {
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
} from './snap';

const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
];

// ERC721 and ERC1155 detection uses ERC165:
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

export const getTokenURI = async (
  address: string,
  tokenId: string,
  aesKey: string,
): Promise<string | null> => {
  try {
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(
      address,
      erc721ConfidentialAbi,
      provider,
    );
    const tokenURIMethod = contract.tokenURI;
    if (!tokenURIMethod) throw new Error('tokenURI method not available');
    const encryptedTokenURI = await tokenURIMethod(BigInt(tokenId));
    const decryptedURI = decryptString(encryptedTokenURI, aesKey);
    if (!decryptedURI.startsWith('https://')) {
      return null;
    }
    return decryptedURI;
  } catch {
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
    const provider = new BrowserProvider(ethereum);
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
  } catch {
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
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(address, erc721Abi, provider);

    if (!contract.symbol || !contract.name) {
      throw new Error('Required ERC721 methods not available');
    }
    const [symbol, name] = await Promise.all([
      contract.symbol(),
      contract.name(),
    ]);

    return { symbol, name };
  } catch {
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
    const provider = new BrowserProvider(ethereum);
    
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
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
    } catch (standardError) {
      try {
        contract = new ethers.Contract(address, erc721ConfidentialAbi, provider);
        
        if (!contract.ownerOf) {
          throw new Error('ownerOf method not available in confidential contract');
        }
        
        const owner = await contract.ownerOf(BigInt(tokenId));
        return owner.toLowerCase() === userAddress.toLowerCase();
      } catch (confidentialError) {
        console.error('Standard ERC721 ownership check failed:', standardError);
        console.error('Confidential ERC721 ownership check failed:', confidentialError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking ERC721 ownership:', error);
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
}> {
  const provider = new BrowserProvider(ethereum);
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
        isERC1155 = await erc165Contract.supportsInterface(
          ERC1155_INTERFACE_ID,
        );
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
      if (!tokenURIMethod) throw new Error('tokenURI method not available');
      const tokenURI = await tokenURIMethod(BigInt(0));
      if (tokenURI) {
        return { type: TokenViewSelector.NFT, confidential: true };
      }
      return { type: TokenViewSelector.NFT, confidential: false };
    } catch {
      return { type: TokenViewSelector.NFT, confidential: false };
    }
  }

  // likely fungible (ERC-20 or ConfidentialERC20).
  const erc20Contract = new ethers.Contract(address, erc20Abi, provider);

  try {
    if (!erc20Contract.decimals || !erc20Contract.symbol || !erc20Contract.totalSupply || !erc20Contract.balanceOf) {
      throw new Error('Required ERC20 methods not available');
    }
    await erc20Contract.decimals();
    await erc20Contract.symbol();
    await erc20Contract.totalSupply();
    await erc20Contract.balanceOf(ZeroAddress);

    try {
      const erc20ConfidentialContract = new ethers.Contract(
        address,
        erc20ConfidentialAbi,
        provider,
      );
      const accountEncryptionMethod = erc20ConfidentialContract.accountEncryptionAddress;
      if (!accountEncryptionMethod) throw new Error('accountEncryptionAddress method not available');
      await accountEncryptionMethod(address);
      return { type: TokenViewSelector.ERC20, confidential: true };
    } catch {
      // Confidential ERC20 check failed - token is standard ERC20
      return { type: TokenViewSelector.ERC20, confidential: false };
    }
  } catch {
    // Standard ERC20 check failed - token type unknown
    return { type: TokenViewSelector.UNKNOWN, confidential: false };
  }
}

export const decryptBalance = (balance: ctUint, aesKey: string): bigint | null => {
  try {
    return decryptUint(balance, aesKey);
  } catch {
    return null;
  }
};

export const checkChainId = async (): Promise<boolean> => {
  const provider = new BrowserProvider(ethereum);

  const chainId = await provider.getNetwork();
  const currentChainId = chainId.chainId.toString();
  
  const { COTI_TESTNET_CHAIN_ID, COTI_MAINNET_CHAIN_ID, setEnvironment } = await import('../config');
    
  if (currentChainId === COTI_TESTNET_CHAIN_ID) {
    setEnvironment('testnet');
    return true;
  }
  
  if (currentChainId === COTI_MAINNET_CHAIN_ID) {
    setEnvironment('mainnet');
    return true;
  }
  
  return false;
};

export const checkIfERC20Unique = async (address: string): Promise<boolean> => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some((token) => token.address === address);
};

export const checkIfERC721Unique = async (address: string, tokenId: string): Promise<boolean> => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some(
    (token) => token.address === address && token.tokenId === tokenId,
  );
};

export const recalculateBalances = async (): Promise<{ balance: bigint; tokenBalances: Tokens }> => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];

  const provider = new BrowserProvider(ethereum);

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    const signerAddress = accounts.length > 0 ? accounts[0] : null;
    
    if (!signerAddress) {
      throw new Error('No account connected');
    }
    
    const signer = await provider.getSigner();
    const balance = await provider.getBalance(signerAddress);

  const tokenBalances: Tokens = await Promise.all(
    tokens.map(async (token) => {
      if (token.type === TokenViewSelector.ERC20) {
        const tokenContract = new Contract(token.address, erc20Abi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf
          ? await tok.balanceOf(signerAddress)
          : null;
        if (token.confidential && state.aesKey && tokenBalance) {
          tokenBalance = decryptBalance(tokenBalance, state.aesKey);
        } else if (token.confidential && !state.aesKey) {
          tokenBalance = null;
        }

        return {
          ...token,
          balance: tokenBalance?.toString() ?? null,
        };
      }

      if (token.type === TokenViewSelector.NFT) {
        const tokenContract = new Contract(
          token.address,
          erc721ConfidentialAbi,
          signer,
        );
        const tok = tokenContract.connect(signer) as Contract;
        const tokenBalance = tok.balanceOf
          ? await tok.balanceOf(signerAddress)
          : null;
        let tokenUri: string | null = token.uri ?? null;
        if (token.confidential && token.tokenId && state.aesKey) {
          tokenUri = await getTokenURI(
            token.address,
            token.tokenId,
            state.aesKey,
          );
        }
        return {
          ...token,
          balance: tokenBalance?.toString() ?? null,
          uri: tokenUri,
        };
      }
      return { ...token, balance: null };
    }),
  );

    await setStateByChainIdAndAddress({
      ...state,
      balance: balance.toString(),
      tokenBalances,
    });
    return { balance, tokenBalances };
  } catch (error) {
    return { 
      balance: BigInt(0), 
      tokenBalances: tokens.map(token => ({ ...token, balance: null }))
    };
  }
};

export const importToken = async (
  address: string,
  name: string,
  symbol: string,
  decimals: string,
  tokenId?: string,
): Promise<void> => {
  const oldState = await getStateByChainIdAndAddress();
  const tokens = oldState.tokenBalances;
  const { type, confidential } = await getTokenType(address);
  if (type === TokenViewSelector.UNKNOWN) {
    return;
  }
  if (type === TokenViewSelector.NFT && !tokenId) {
    return;
  }
  tokens.push({
    address,
    name,
    symbol,
    balance: null,
    type,
    confidential,
    decimals,
    tokenId: tokenId ?? null,
  });
  await setStateByChainIdAndAddress({ ...oldState, tokenBalances: tokens });
};

export const hideToken = async (address: string): Promise<void> => {
  const oldState = await getStateByChainIdAndAddress();
  const tokens = oldState.tokenBalances;
  const updatedTokens = tokens.filter((token) => token.address !== address);
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
  maxDecimals = 4
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
  } catch {
    return '0';
  }
};