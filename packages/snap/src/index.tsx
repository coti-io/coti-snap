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
import type {
  OnInstallHandler,
  OnRpcRequestHandler,
  OnUpdateHandler,
} from '@metamask/snaps-sdk';
import {
  type OnHomePageHandler,
  type OnUserInputHandler,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';

import { HideToken } from './components/HideToken';
import { Home } from './components/Home';
import { ImportERC20 } from './components/ImportERC20';
import { ImportERC721 } from './components/ImportERC721';
import { Settings } from './components/Settings';
import { TokenDetails } from './components/TokenDetails';
import { WrongChain } from './components/WrongChain';
import { TokenViewSelector } from './types';
import { getSVGfromMetadata } from './utils/image';
import {
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
} from './utils/snap';
import {
  checkChainId,
  hideToken,
  importToken,
  recalculateBalances,
  getERC20Details,
  getERC721Details,
  truncateAddress,
  checkIfERC20Unique,
  checkIfERC721Unique
} from './utils/token';

export const returnToHomePage = async (id: string) => {
  const { balance, tokenBalances, tokenView, aesKey } =
    await getStateByChainIdAndAddress();
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <Home
          balance={BigInt(balance ?? 0)}
          tokenBalances={tokenBalances}
          tokenView={tokenView ?? TokenViewSelector.ERC20}
          aesKey={aesKey}
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

export const onInstall: OnInstallHandler = async () => {
  await ethereum.request({ method: 'eth_requestAccounts' });
  const state = await getStateByChainIdAndAddress();
  !state.balance &&
    (await setStateByChainIdAndAddress({
      balance: '0',
      tokenBalances: [],
      aesKey: null,
      tokenView: TokenViewSelector.ERC20,
    }));
};

export const onHomePage: OnHomePageHandler = async () => {
  const chainCheck = await checkChainId();
  if (!chainCheck) {
    return {
      content: <WrongChain />,
    };
  }
  const { balance, tokenBalances } = await recalculateBalances();
  const state = await getStateByChainIdAndAddress();
  await setStateByChainIdAndAddress({
    ...state,
    tokenView: TokenViewSelector.ERC20,
  });
  return {
    content: (
      <Home
        balance={balance}
        tokenBalances={tokenBalances}
        tokenView={TokenViewSelector.ERC20}
        aesKey={state.aesKey}
      />
    ),
  };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    if (event.name?.startsWith('token-details-')) {
      const tokenData = event.name.slice('token-details-'.length);
      const tokenAddress = tokenData.split('-')[0];
      const tokenId = tokenData.split('-')[1];
      const state = await getStateByChainIdAndAddress();
      const token = state.tokenBalances.find((tkn) => {
        if (tokenId) {
          return tkn.address === tokenAddress && tkn.tokenId === tokenId;
        }
        return tkn.address === tokenAddress;
      });
      if (token) {
        if (token.uri) {
          const tokenImageBase64 = await getSVGfromMetadata(token.uri);
          token.image = tokenImageBase64;
        }
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <TokenDetails token={token} />,
          },
        });
      }
      return;
    }
    if (event.name?.startsWith('confirm-hide-token-')) {
      const tokenAddress = event.name.slice('confirm-hide-token-'.length);
      const state = await getStateByChainIdAndAddress();
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
    switch (event.name) {
      case 'import-erc721':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <ImportERC721 />,
          },
        });
        return;

      case 'import-erc20':
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <ImportERC20 />,
          },
        });

        return;

      case 'view-tokens-nft':
        const veiwNFTstate = await getStateByChainIdAndAddress();
        await setStateByChainIdAndAddress({
          ...veiwNFTstate,
          tokenView: TokenViewSelector.NFT,
        });
        await recalculateBalances();
        await returnToHomePage(id);
        return;
      case 'view-tokens-erc20':
        const veiwERC20state = await getStateByChainIdAndAddress();
        await setStateByChainIdAndAddress({
          ...veiwERC20state,
          tokenView: TokenViewSelector.ERC20,
        });
        await recalculateBalances();
        await returnToHomePage(id);
        return;
      case 'settings-button':
        try {
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <Settings />,
            },
          });
        } catch {
          await returnToHomePage(id);
          return;
        }
        return;
      case 'token-cancel':
        await returnToHomePage(id);
        return;
      case 'erc721-submit':
        const erc721state = await snap.request({
          method: 'snap_getInterfaceState',
          params: {
            id,
          },
        });
        const erc721formState = erc721state['erc721-form-to-fill'] as Record<
          string,
          string | boolean | null
        >;
        try {
          if (
            !erc721formState ||
            !erc721formState['erc721-address'] ||
            erc721formState['erc721-address'].toString().length !== 42 ||
            !erc721formState['erc721-id']
          ) {
            throw new Error('Invalid form state');
          }
          const address = erc721formState['erc721-address'] as string;
          const tokenId = erc721formState['erc721-id'] as string;
          const tokenIsUnique = await checkIfERC721Unique(address, tokenId);
          if (!tokenIsUnique) {
            throw new Error('Token already exists');
          }
          const erc721Info = await getERC721Details(address);
          if (address && tokenId && erc721Info) {
            await importToken(
              address,
              erc721Info.name ?? address,
              erc721Info.symbol ?? truncateAddress(address),
              '',
              tokenId,
            );
          }
          await recalculateBalances();
          await returnToHomePage(id);
        } catch {
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <ImportERC721 errorInForm={true} />,
            },
          });
          return;
        }
        return;
      case 'token-erc20-submit':
        const erc20state = await snap.request({
          method: 'snap_getInterfaceState',
          params: {
            id,
          },
        });
        const erc20formState = erc20state['erc20-form-to-fill'] as Record<
          string,
          string | boolean | null
        >;
        try {
          if (
            !erc20formState ||
            !erc20formState['erc20-address'] ||
            erc20formState['erc20-address'].toString().length !== 42 ||
            !erc20formState['erc20-decimals'] ||
            !erc20formState['erc20-name'] ||
            !erc20formState['erc20-symbol']
          ) {
            throw new Error('Invalid form state');
          }
          const address = erc20formState['erc20-address'] as string;
          const tokenIsUnique = await checkIfERC20Unique(address);
          if (!tokenIsUnique) {
            throw new Error('Token already exists');
          }
          const name = erc20formState['erc20-name'] as string;
          const decimals = erc20formState['erc20-decimals'] as string;
          const symbol = erc20formState['erc20-symbol'] as string;
          await importToken(address, name, symbol, decimals);
          await recalculateBalances();
          await returnToHomePage(id);
        } catch {
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <ImportERC20 errorInForm={true} />,
            },
          });
          return;
        }
    }
  } else if (event.type === UserInputEventType.InputChangeEvent) {
    switch (event.name) {
      case 'erc20-address':
        const tokenInfo = await getERC20Details(event.value as string);
        if (tokenInfo) {
          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: (
                <ImportERC20
                  symbol={tokenInfo.symbol}
                  name={tokenInfo.name}
                  decimals={tokenInfo.decimals}
                />
              ),
            },
          });
        } else {
        }
    }
  }
};

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const getState = await getStateByChainIdAndAddress();
  switch (request.method) {
    case 'encrypt':
      if (!request.params) {
        return null;
      }

      const { value: textToEncrypt } = request.params as Record<string, string>;
      if (!textToEncrypt) {
        return null;
      }

      if (!getState.aesKey) {
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
          encrypt(encodeKey(getState.aesKey), encodeString(textToEncrypt)),
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

      if (!getState.aesKey) {
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
            encodeKey(getState.aesKey),
            new Uint8Array([...Object.values(r)]),
            new Uint8Array([...Object.values(ciphertext)]),
          ),
        );
      }
      return null;

    case 'has-aes-key':
      if (getState.aesKey) {
        return true;
      }

      return false;

    case 'get-aes-key':
      if (!getState.aesKey) {
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

      if (getState.aesKey) {
        const revealaesKey = await snap.request({
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

        if (revealaesKey) {
          return getState.aesKey;
        }
      }

      return null;

    case 'delete-aes-key':
      if (!getState.aesKey) {
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
        await setStateByChainIdAndAddress({
          ...getState,
          aesKey: null,
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

      if (!getState.aesKey) {
        await setStateByChainIdAndAddress({
          ...getState,
          aesKey: newUserAesKey,
        });

        return true;
      }

      return null;

    case 'connect-to-wallet':
      await ethereum.request({ method: 'eth_requestAccounts' });
      return true;

    case 'get-permissions':
      const permissions = await ethereum.request({
        method: 'wallet_getPermissions',
        params: [],
      });

      return permissions ?? [];

    default:
      throw new Error('Method not found.');
  }
};
