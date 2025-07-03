import type { ctUint } from '@coti-io/coti-sdk-typescript';
import { decryptUint, decryptString } from '@coti-io/coti-sdk-typescript';
import { BrowserProvider, Contract, ethers, ZeroAddress, EventLog } from 'ethers';

import erc20Abi from '../abis/ERC20.json';
import erc20ConfidentialAbi from '../abis/ERC20Confidential.json';
import erc721Abi from '../abis/ERC721.json';
import erc721ConfidentialAbi from '../abis/ERC721Confidential.json';
import { CHAIN_ID } from '../config';
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
  AESKey: string,
): Promise<string | null> => {
  try {
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(
      address,
      erc721ConfidentialAbi,
      provider,
    );
    const encryptedTokenURI = await contract.tokenURI!(BigInt(tokenId));
    const decryptedURI = decryptString(encryptedTokenURI, AESKey);
    if (!decryptedURI.startsWith('https://')) {
      return null;
    }
    return decryptedURI;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getERC20Details = async (
  address: string,
  // AESKey: string,
): Promise<{
  decimals: string | null;
  symbol: string | null;
  name: string | null;
} | null> => {
  try {
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(address, erc20Abi, provider);

    const [_decimals, symbol, name] = await Promise.all([
      contract.decimals!(),
      contract.symbol!(),
      contract.name!(),
    ]);

    const decimals = _decimals.toString();
    return { decimals, symbol, name };
  } catch (e) {
    console.error(e);
    return null;
  }
};
export const getERC721Details = async (
  address: string,
  // AESKey: string,
): Promise<{
  symbol: string | null;
  name: string | null;
} | null> => {
  try {
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(address, erc721Abi, provider);

    const [symbol, name] = await Promise.all([
      contract.symbol!(),
      contract.name!(),
    ]);

    return { symbol, name };
  } catch (e) {
    console.error(e);
    return null;
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
    } catch (e) {
      console.error(`Error checking for ERC-721 support: ${e}`);
    }

    if (!isERC721) {
      try {
        isERC1155 = await erc165Contract.supportsInterface(
          ERC1155_INTERFACE_ID,
        );
      } catch (e) {
        console.error(`Error checking for ERC-1155 support: ${e}`);
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
      const tokenURI = await contract.tokenURI!(BigInt(0));
      if (tokenURI) {
        return { type: TokenViewSelector.NFT, confidential: true };
      }
      return { type: TokenViewSelector.NFT, confidential: false };
    } catch (e) {
      return { type: TokenViewSelector.NFT, confidential: false };
    }
  }

  // likely fungible (ERC-20 or ConfidentialERC20).
  const erc20Contract = new ethers.Contract(address, erc20Abi, provider);

  try {
    await erc20Contract.decimals!();
    await erc20Contract.symbol!();
    await erc20Contract.totalSupply!();
    await erc20Contract.balanceOf!(ZeroAddress);

    try {
      const erc20ConfidentialContract = new ethers.Contract(
        address,
        erc20ConfidentialAbi,
        provider,
      );
      await erc20ConfidentialContract.accountEncryptionAddress!(address);
      return { type: TokenViewSelector.ERC20, confidential: true };
    } catch (err) {
      console.error(`Error checking for ConfidentialERC20 support: ${err}`);
    }
    return { type: TokenViewSelector.ERC20, confidential: false };
  } catch (e) {
    console.error(`Error checking for standard ERC-20 support: ${e}`);
  }

  return { type: TokenViewSelector.UNKNOWN, confidential: false };
}

export const decryptBalance = (balance: ctUint, AESkey: string) => {
  try {
    return decryptUint(balance, AESkey);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const checkChainId = async () => {
  const provider = new BrowserProvider(ethereum);

  const chainId = await provider.getNetwork();

  return chainId.chainId.toString() === CHAIN_ID;
};

export const checkIfERC20Unique = async (address: string) => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some((token) => token.address === address);
};

export const checkIfERC721Unique = async (address: string, tokenId: string) => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];
  return !tokens.some(
    (token) => token.address === address && token.tokenId === tokenId,
  );
};

export const recalculateBalances = async () => {
  const state = await getStateByChainIdAndAddress();
  const tokens = state.tokenBalances || [];

  const provider = new BrowserProvider(ethereum);

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances: Tokens = await Promise.all(
    tokens.map(async (token) => {
      if (token.type === TokenViewSelector.ERC20) {
        const tokenContract = new Contract(token.address, erc20Abi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf
          ? await tok.balanceOf(signerAddress)
          : null;
        if (token.confidential && state.AESKey && tokenBalance) {
          tokenBalance = decryptBalance(tokenBalance, state.AESKey);
        } else if (token.confidential && !state.AESKey) {
          tokenBalance = null;
        }

        return {
          ...token,
          balance: tokenBalance?.toString() || null,
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
        if (token.confidential && token.tokenId && state.AESKey) {
          tokenUri = await getTokenURI(
            token.address,
            token.tokenId,
            state.AESKey,
          );
        }
        return {
          ...token,
          balance: tokenBalance?.toString() || null,
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
};

export const importToken = async (
  address: string,
  name: string,
  symbol: string,
  decimals: string,
  tokenId?: string,
) => {
  const oldState = await getStateByChainIdAndAddress();
  const tokens = oldState.tokenBalances;
  const { type, confidential } = await getTokenType(address);
  if (type === TokenViewSelector.UNKNOWN) {
    console.error(
      `Token ${name} (${symbol}) at address ${address} with ${decimals} decimals is unknown`,
    );
    return;
  }
  if (type === TokenViewSelector.NFT && !tokenId) {
    console.error(
      `Token ${name} (${symbol}) at address ${address} is an NFT but no tokenId was provided`,
    );
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
    tokenId: tokenId || null,
  });
  await setStateByChainIdAndAddress({ ...oldState, tokenBalances: tokens });
};

export const hideToken = async (address: string) => {
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