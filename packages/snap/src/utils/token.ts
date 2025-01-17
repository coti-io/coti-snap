import type { ctUint } from '@coti-io/coti-sdk-typescript';
import { decryptUint, decryptString } from '@coti-io/coti-sdk-typescript';
import { BrowserProvider, Contract, ethers, ZeroAddress } from 'ethers';

import erc20Abi from '../abis/ERC20.json';
import erc20ConfidentialAbi from '../abis/ERC20Confidential.json';
import erc721Abi from '../abis/ERC721.json';
import erc721ConfidentialAbi from '../abis/ERC721Confidential.json';
import type { State, Tokens } from '../types';
import { CHAIN_ID } from '../config';
import { TokenViewSelector } from '../types';
import { getStateData, setStateData } from './snap';

const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
];

// ERC721 and ERC1155 detection uses ERC165:
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';


export const getTokenURI = async (address: string, tokenId: string, AESKey: string): Promise<string | null> => {
  try {
    const provider = new BrowserProvider(ethereum);
    const contract = new ethers.Contract(address, erc721ConfidentialAbi, provider);
    const encryptedTokenURI = await contract.tokenURI!(BigInt(tokenId));
    return decryptString(encryptedTokenURI, AESKey);
  }
  catch (e) {
    console.error(e);
    return null;
  }
}


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
      console.log(`Checking for ERC-721 support...`);
      console.log(erc165Contract.supportsInterface);

      isERC721 = await erc165Contract.supportsInterface(ERC721_INTERFACE_ID);
      console.log(`isERC721: ${isERC721}`);
    } catch (e) {
      console.log(`Error checking for ERC-721 support: ${e}`);
    }

    if (!isERC721) {
      try {
        isERC1155 = await erc165Contract.supportsInterface(
          ERC1155_INTERFACE_ID,
        );
      } catch (e) {
        console.log(`Error checking for ERC-1155 support: ${e}`);
      }
    }
  }

  if (isERC721 || isERC1155) {
    console.log(
      `Contract ${address} is an NFT contract (likely ERC-${isERC721 ? '721' : '1155'
      }).`,
    );
    try {
      const contract = new ethers.Contract(address, erc721ConfidentialAbi, provider);
      const tokenURI = await contract.tokenURI!(BigInt(0));
      if (tokenURI) {
        console.log(`Contract ${address} has tokenURI method`);
        return { type: TokenViewSelector.NFT, confidential: true };
      }
      return { type: TokenViewSelector.NFT, confidential: false };
    } catch (e) {
      console.log(`Error checking for tokenURI support: ${e}`);
      return { type: TokenViewSelector.NFT, confidential: false };
    }
  }

  // likely fungible (ERC-20 or ConfidentialERC20).
  const erc20Contract = new ethers.Contract(address, erc20Abi, provider);

  try {
    await erc20Contract.decimals!()
    await erc20Contract.symbol!()
    await erc20Contract.totalSupply!()
    await erc20Contract.balanceOf!(ZeroAddress)

    try {
      const erc20ConfidentialContract = new ethers.Contract(address, erc20ConfidentialAbi, provider);
      await erc20ConfidentialContract.accountEncryptionAddress!(address)
      console.log(`Contract ${address} is likely a ConfidentialERC20 token.`);
      return { type: TokenViewSelector.ERC20, confidential: true };
    } catch (err) {
      console.log(`Error checking for ConfidentialERC20 support: ${err}`);
    }
    console.log(`Contract ${address} is a standard ERC-20 token.`);

    return { type: TokenViewSelector.ERC20, confidential: false };
  } catch (e) {
    console.log(`Error checking for standard ERC-20 support: ${e}`);
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

  if (chainId.chainId.toString() !== CHAIN_ID) {
    return true;
  }
  return false;
};

export const recalculateBalances = async () => {
  const state = await getStateData<State>();
  const tokens = state?.tokenBalances || [];

  const provider = new BrowserProvider(ethereum);

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances: Tokens = await Promise.all(
    tokens.map(async (token) => {
      if (token.type === TokenViewSelector.ERC20) {
        const tokenContract = new Contract(token.address, erc20Abi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf ? await tok.balanceOf(signerAddress) : null;
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
        const tokenContract = new Contract(token.address, erc721ConfidentialAbi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf
          ? await tok.balanceOf(signerAddress)
          : null;
        let tokenUri: string | null = token.uri ?? null;
        if (token.confidential && token.tokenId && state.AESKey) {
          tokenUri = await getTokenURI(token.address, token.tokenId, state.AESKey);
        }
        return { ...token, balance: tokenBalance?.toString() || null, uri: tokenUri };
      }
      return { ...token, balance: null };
    }),
  );

  await setStateData<State>({
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
  const oldState = await getStateData<State>();
  const tokens = oldState.tokenBalances;
  console.log(
    `Importing token ${name} (${symbol}) at address ${address} with ${decimals} decimals`,
  );
  const { type, confidential } = await getTokenType(address);
  if (type === TokenViewSelector.UNKNOWN) {
    console.log(
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
  tokens.push({ address, name, symbol, balance: null, type, confidential, decimals, tokenId: tokenId || null });
  await setStateData<State>({ ...oldState, tokenBalances: tokens });
};

export const hideToken = async (address: string) => {
  const oldState = await getStateData<State>();
  const tokens = oldState.tokenBalances;
  console.log(`Hiding token at address ${address}`);
  const updatedTokens = tokens.filter((token) => token.address !== address);
  await setStateData<State>({ ...oldState, tokenBalances: updatedTokens });
};

export const truncateAddress = (address: string, length = 6): string => {
  if (address.length <= length * 2) {
    return address;
  }
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};
