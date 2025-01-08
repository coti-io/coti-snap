/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
import {
  encodeString,
  encrypt,
  encodeKey,
  decrypt,
} from '@coti-io/coti-sdk-typescript';
import type { OnRpcRequestHandler, OnUpdateHandler } from '@metamask/snaps-sdk';
import {
  type OnHomePageHandler,
  type OnUserInputHandler,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';

import { HideToken } from './components/HideToken';
import { Home } from './components/Home';
import { ImportToken } from './components/ImportToken';
import { Settings } from './components/Settings';
import { TokenDetails } from './components/TokenDetails';
import type { State } from './types';
import { TokenViewSelector } from './types';
import { getStateData, setStateData } from './utils/snap';
import { hideToken, importToken, recalculateBalances } from './utils/token';

export const returnToHomePage = async (id: string) => {
  const { balance, tokenBalances, tokenView, AESKey } =
    await getStateData<State>();
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <Home
          balance={BigInt(balance || 0)}
          tokenBalances={tokenBalances}
          tokenView={tokenView ?? TokenViewSelector.ERC20}
          AESKey={AESKey}
        />
      ),
    },
  });
};

export const onUpdate: OnUpdateHandler = async () => {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'clear',
    },
  });
};

export const onHomePage: OnHomePageHandler = async () => {
  const { balance, tokenBalances } = await recalculateBalances();
  const state = await getStateData<State>();

  await setStateData<State>({
    ...state,
    tokenView: TokenViewSelector.ERC20,
  });
  return {
    content: (
      <Home
        balance={balance}
        tokenBalances={tokenBalances}
        tokenView={TokenViewSelector.ERC20}
        AESKey={state.AESKey}
      />
    ),
  };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  console.log('User input event:', event);
  if (event.type === UserInputEventType.ButtonClickEvent) {
    if (event.name?.startsWith('token-details-')) {
      const tokenAddress = event.name.slice('token-details-'.length);
      const state = await getStateData<State>();
      const token = state.tokenBalances.find(
        (tkn) => tkn.address === tokenAddress,
      );
      if (token) {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <TokenDetails
                tokenName={token.name}
                tokenBalance={token.balance ? token.balance : 'N/A'}
                tokenAddress={token.address}
                tokenSymbol={token.symbol}
              />
            ),
          },
        });
      }
      return;
    }
    if (event.name?.startsWith('confirm-hide-token-')) {
      const tokenAddress = event.name.slice('confirm-hide-token-'.length);
      const state = await getStateData<State>();
      const token = state.tokenBalances.find(
        (tkn) => tkn.address === tokenAddress,
      );
      if (token) {
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <HideToken tokenAddress={token.address} />,
          },
        });
      }
      return;
    }
    if (event.name?.startsWith('hide-token-confirmed-')) {
      const tokenAddress = event.name.slice('hide-token-confirmed-'.length);

      if (tokenAddress) {
        await hideToken(tokenAddress);
      }
      await recalculateBalances();
      await returnToHomePage(id);

      return;
    }
    const { balance, tokenBalances, AESKey } = await getStateData<State>();
    switch (event.name) {
      case 'import-token-button':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <ImportToken />,
          },
        });
        return;
      case 'view-tokens-nft':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <Home
                balance={BigInt(balance || 0)}
                tokenBalances={tokenBalances}
                tokenView={TokenViewSelector.NFT}
                AESKey={AESKey}
              />
            ),
          },
        });
        return;
      case 'view-tokens-tokens':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: (
              <Home
                balance={BigInt(balance || 0)}
                tokenBalances={tokenBalances}
                tokenView={TokenViewSelector.ERC20}
                AESKey={AESKey}
              />
            ),
          },
        });
        return;
      case 'settings-button':
        console.log('Settings');
        try {
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <Settings />,
            },
          });
        } catch (error) {
          console.error(error);
        }
        return;
      case 'token-cancel':
        await returnToHomePage(id);
        return;
      case 'token-submit':
        const state = await snap.request({
          method: 'snap_getInterfaceState',
          params: {
            id,
          },
        });
        const formState = state['form-to-fill'] as Record<
          string,
          string | boolean | null
        >;
        if (
          formState &&
          formState['token-address'] &&
          formState['token-name'] &&
          formState['token-symbol']
        ) {
          const address = formState['token-address'] as string;
          const name = formState['token-name'] as string;
          const symbol = formState['token-symbol'] as string;
          await importToken(address, name, symbol);
        } else {
          // TODO: add validation
          console.log('Invalid form state:', formState);
        }
        await recalculateBalances();
        await returnToHomePage(id);
    }
  } else if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'selector-tokens-nft':
        // erc20 or nft
        const selectedTokenView: TokenViewSelector =
          event.value as TokenViewSelector;
        const state = await getStateData<State>();
        await setStateData<State>({ ...state, tokenView: selectedTokenView });
        await recalculateBalances();
        await returnToHomePage(id);
    }
  }
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const getState = await getStateData<State>();
  switch (request.method) {
    case 'encrypt':
      if (!request.params) {
        return null;
      }

      const { value: textToEncrypt } = request.params as Record<string, string>;
      if (!textToEncrypt) {
        return null;
      }

      // const onEncryptState = await getStateData<State>();
      if (!getState.AESKey) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Warning</Heading>
                <Text>Cannot encrypt value. AES key not found.</Text>
              </Box>
            ),
          },
        });

        return null;
      }

      const encryptResult = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Would you like to encrypt this value?</Heading>
              <Text>Value to encrypt: "{String(textToEncrypt)}"</Text>
            </Box>
          ),
        },
      });

      if (encryptResult) {
        return JSON.stringify(
          encrypt(encodeKey(getState.AESKey), encodeString(textToEncrypt)),
        );
      }

      return null;

    case 'decrypt':
      if (!request.params) {
        return null;
      }

      const { value: encryptedValue } = request.params as Record<
        string,
        string
      >;

      if (!encryptedValue) {
        return null;
      }

      const { ciphertext, r } = JSON.parse(encryptedValue) as {
        ciphertext: { [key: string]: number };
        r: { [key: string]: number };
      };

      // const onDecryptState = await getStateData<State>();

      if (!getState.AESKey) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Warning</Heading>
                <Text>Cannot decrypt value. AES key not found.</Text>
              </Box>
            ),
          },
        });
        return null;
      }

      const decryptResult = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Would you like to decrypt this value?</Heading>
              <Text>Value to decrypt: "{encryptedValue}"</Text>
            </Box>
          ),
        },
      });
      if (decryptResult) {
        return JSON.stringify(
          decrypt(
            encodeKey(getState.AESKey),
            new Uint8Array([...Object.values(r)]),
            new Uint8Array([...Object.values(ciphertext)]),
          ),
        );
      }
      return null;

    case 'has-aes-key':
      // const onGetAESKeyState = await getStateData<State>();

      if (getState.AESKey) {
        return true;
      }

      return false;

    case 'get-aes-key':
      // const onSetAESKeyState = await getStateData<State>();

      if (!getState.AESKey) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Warning</Heading>
                <Text>AES key not found.</Text>
              </Box>
            ),
          },
        });
        return null;
      }

      if (getState.AESKey) {
        const revealAESKey = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: (
              <Box>
                <Heading>Reveal AES Key</Heading>
                <Text>Approve to reveal AES Key</Text>
              </Box>
            ),
          },
        });

        if (revealAESKey) {
          return getState.AESKey;
        }
      }

      return null;

    case 'delete-aes-key':
      // const state = await getStateData<State>();

      if (!getState.AESKey) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Warning</Heading>
                <Text>AES key not found.</Text>
              </Box>
            ),
          },
        });
        return null;
      }

      const deleteResult = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Delete AES Key</Heading>
              <Text>Approve to delete the AES Key</Text>
            </Box>
          ),
        },
      });

      if (deleteResult) {
        await setStateData<State>({
          ...getState,
          AESKey: null,
        });
        return true;
      }

      return null;

    case 'set-aes-key':
      const { newUserAesKey } = request.params as { newUserAesKey: string };

      if (!newUserAesKey) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Error</Heading>
                <Text>New AES key not provided.</Text>
              </Box>
            ),
          },
        });
        return null;
      }

      if (!getState.AESKey) {
        await setStateData<State>({
          ...getState,
          AESKey: newUserAesKey,
        });

        return true;
      }

      return null;

    default:
      throw new Error('Method not found.');
  }
};
