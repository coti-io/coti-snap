import { type OnHomePageHandler, OnUpdateHandler, type OnUserInputHandler, UserInputEventType } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Button, Row, Form, Input, Container, Footer, Field, Section, Selector, SelectorOption, Card } from '@metamask/snaps-sdk/jsx';
import {
  encodeString,
  decryptUint,
  encrypt,
  encodeKey
} from "@coti-io/coti-sdk-typescript"
import { Contract, BrowserProvider, formatEther } from 'ethers';

import { Tokens, State, TokenViewSelector } from './types';
import { Home } from './components/Home';
import { ImportToken } from './components/ImportToken';
import erc20Abi from './abis/ERC20.json';
import { getStateData, setStateData } from './utils/snap'

// should be stored in a secure storage after onboarding process
const testAESKey = '50764f856be3f636c09faf092be20d0c';

export const recalculateBalances = async () => {
  const state = await getStateData<State>();
  const tokens = state?.tokenBalances || [];

  const provider = new BrowserProvider(ethereum);
  // TODO: check if chain id is correct
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const balance = await provider.getBalance(signerAddress);

  const tokenBalances = await Promise.all(tokens.map(async (token) => {
    const tokenContract = new Contract(token.address, erc20Abi, signer);
    const tok = (tokenContract.connect(signer) as Contract)
    const tokenBalance = tok.balanceOf ? await tok.balanceOf() : null;
    const decryptedBalance = tokenBalance ? decryptUint(tokenBalance, testAESKey) : null;
    return { ...token, balance: decryptedBalance?.toString() || null };
  }));
  
  await setStateData<State>({ ...state, balance: balance.toString(), tokenBalances });
  
  return { balance, tokenBalances };
}

export const importToken = async (address: string, name: string, symbol: string) => {
  const oldState = await getStateData<State>();
  const tokens = oldState.tokenBalances;
  // TODO: check supportsInterface of the contract to check if it is ERC20 or NFT or Confidential Token etc
  // TODO: determine token type
  tokens.push({ address, name, symbol, balance: null, type: TokenViewSelector.ERC20 });
  await setStateData<State>({ ...oldState, tokenBalances: tokens });
}

export const returnToHomePage = async (id: string) => {
  const { balance, tokenBalances, tokenView } = await getStateData<State>();
  await snap.request({
    method: "snap_updateInterface",
    params: {
      id,
      ui: <Home balance={BigInt(balance || 0)} tokenBalances={tokenBalances} tokenView={tokenView || TokenViewSelector.ERC20} />,
    },
  });
}

export const onUpdate: OnUpdateHandler = async () => {
  await snap.request({
    method: "snap_manageState",
    params: {
      operation: "clear",
    },
  })
}

export const onHomePage: OnHomePageHandler = async () => {
  const { balance, tokenBalances } = await recalculateBalances();
  const state = await getStateData<State>();
  await setStateData<State>({ ...state, tokenView: TokenViewSelector.ERC20 });
  return { content: <Home balance={balance} tokenBalances={tokenBalances} tokenView={TokenViewSelector.ERC20}  /> };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'import-token-button':
        await snap.request({
          method: "snap_updateInterface",
          params: {
            id,
            ui: <ImportToken />,
          },
        });
        break;
      case 'token-cancel':
        await returnToHomePage(id);
        break;
      case 'token-submit':
        const state = await snap.request({
          method: "snap_getInterfaceState",
          params: {
            id,
          },
        })
        const formState = state['form-to-fill'] as Record<string, string | boolean | null>;
        if (formState && formState['token-address'] && formState['token-name']) {
          const address = formState['token-address'] as string;
          const name = formState['token-name'] as string;
          const symbol = name.slice(0, 3).toUpperCase();
          await importToken(address, name, symbol);
        } else {
          //TODO: add validation
          console.log('Invalid form state:', formState);
        }
        await recalculateBalances();
        await returnToHomePage(id);
        break;
    }
  } else if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'selector-tokens-nft':
        // erc20 or nft
        const selectedTokenView: TokenViewSelector = event.value as TokenViewSelector;
        const state = await getStateData<State>();
        await setStateData<State>({ ...state, tokenView: selectedTokenView });
        await recalculateBalances();
        await returnToHomePage(id);
        break;
    }
  }
}
