import type { ctUint } from '@coti-io/coti-sdk-typescript';
import { decryptUint } from '@coti-io/coti-sdk-typescript';
import { BrowserProvider, Contract, ethers, ZeroAddress } from 'ethers';

import erc20Abi from '../abis/ERC20.json';
import erc721Abi from '../abis/ERC721.json';
import type { State } from '../types';
import { TokenViewSelector } from '../types';
import { getStateData, setStateData } from './snap';

const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
];
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
];

// ERC721 and ERC1155 detection uses ERC165:
const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

const CONFIDENTIAL_ERC20_ABI = [
  {
    inputs: [],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'ctUint64',
        name: 'balance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

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
      `Contract ${address} is an NFT contract (likely ERC-${
        isERC721 ? '721' : '1155'
      }).`,
    );
    console.log(
      `Cannot distinguish ConfidentialERC721 from standard ERC-721 if no unique methods are present.`,
    );
    return { type: TokenViewSelector.NFT, confidential: false };
  }

  // likely fungible (ERC-20 or ConfidentialERC20).
  const erc20Contract = new ethers.Contract(address, ERC20_ABI, provider);

  let isStandardERC20 = false;
  try {
    const decimals = erc20Contract.decimals
      ? await erc20Contract.decimals()
      : undefined;
    const symbol = erc20Contract.symbol
      ? await erc20Contract.symbol()
      : undefined;
    const totalSupply = erc20Contract.totalSupply
      ? await erc20Contract.totalSupply()
      : undefined;
    // Also try a known address; if it reverts, it might not be a standard ERC-20
    const testBalance = erc20Contract.balanceOf
      ? await erc20Contract.balanceOf(ZeroAddress)
      : undefined;
    if (
      typeof decimals === 'number' &&
      typeof symbol === 'string' &&
      totalSupply &&
      testBalance !== undefined
    ) {
      isStandardERC20 = true;
    }
  } catch (e) {
    console.log(`Error checking for standard ERC-20 support: ${e}`);
  }

  if (isStandardERC20) {
    console.log(`Contract ${address} is a standard ERC-20 token.`);
    return { type: TokenViewSelector.ERC20, confidential: false };
  }

  // For ConfidentialERC20, calling balanceOf() with no arguments
  // A standard ERC-20 does not have a no-argument balanceOf().
  const confidentialContract = new ethers.Contract(
    address,
    CONFIDENTIAL_ERC20_ABI,
    provider,
  );
  try {
    confidentialContract.balanceOf
      ? await confidentialContract.balanceOf()
      : undefined;
    console.log(`Contract ${address} is likely a ConfidentialERC20 token.`);
    return { type: TokenViewSelector.ERC20, confidential: true };
  } catch (err) {
    console.log(`Contract ${address} does not match standard ERC-20 or ConfidentialERC20 interfaces. 
It might be a non-standard token or require further inspection.`);
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

export const recalculateBalances = async () => {
  const state = await getStateData<State>();
  const tokens = state?.tokenBalances || [];

  const provider = new BrowserProvider(ethereum);

  // TODO: check if chain id is correct
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances = await Promise.all(
    tokens.map(async (token) => {
      if (token.type === TokenViewSelector.ERC20) {
        const tokenContract = new Contract(token.address, erc20Abi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf ? await tok.balanceOf() : BigInt(0);

        if (token.confidential) {
          if (state.AESKey === null) {
            return {
              ...token,
              balance: null,
            };
          }
          tokenBalance = token.confidential
            ? decryptBalance(tokenBalance, state.AESKey)
            : tokenBalance;
        }

        return {
          ...token,
          balance: tokenBalance?.toString() || null,
        };
      }

      if (token.type === TokenViewSelector.NFT) {
        const tokenContract = new Contract(token.address, erc721Abi, signer);
        const tok = tokenContract.connect(signer) as Contract;
        let tokenBalance = tok.balanceOf
          ? await tok.balanceOf(signerAddress)
          : null;

        if (token.confidential && state.AESKey) {
          tokenBalance = tokenBalance
            ? decryptUint(tokenBalance, state.AESKey)
            : null;
        }
        return { ...token, balance: tokenBalance?.toString() || null };
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
) => {
  const oldState = await getStateData<State>();
  const tokens = oldState.tokenBalances;
  console.log(`Importing token ${name} (${symbol}) at address ${address}`);
  const { type, confidential } = await getTokenType(address);
  if (type === TokenViewSelector.UNKNOWN) {
    console.log(`Token ${name} (${symbol}) at address ${address} is unknown`);
    return;
  }
  tokens.push({ address, name, symbol, balance: null, type, confidential });
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
