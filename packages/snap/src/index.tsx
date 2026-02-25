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
import { UserInputEventType } from '@metamask/snaps-sdk';
import type {
  OnHomePageHandler,
  OnInstallHandler,
  OnRpcRequestHandler,
  OnUpdateHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';

import { HideToken } from './components/HideToken';
import { Home } from './components/Home';
import { ImportERC20 } from './components/ImportERC20';
import { ImportERC721 } from './components/ImportERC721';
import { Settings } from './components/Settings';
import { TokenDetails } from './components/TokenDetails';
import { WrongChain } from './components/WrongChain';
import { setEnvironment } from './config';
import { TokenViewSelector } from './types';
import { getSVGfromMetadata } from './utils/image';
import {
  getStateByChainIdAndAddress,
  setStateByChainIdAndAddress,
  setExpectedEnvironment,
  getExpectedEnvironment,
  getStateIdentifier,
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
  checkIfERC721Unique,
  checkERC721Ownership,
} from './utils/token';
import { buildItUint256, deriveSnapWallet } from './utils/itUint';

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

  try {
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
  } catch (error) {
    const state = await getStateByChainIdAndAddress();
    return {
      content: (
        <Home
          balance={BigInt(0)}
          tokenBalances={[]}
          tokenView={TokenViewSelector.ERC20}
          aesKey={state.aesKey}
        />
      ),
    };
  }
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
        // Show immediately with default placeholder image
        await snap.request({
          method: 'snap_updateInterface',
          params: {
            id,
            ui: <TokenDetails token={token} />,
          },
        });

        // Then fetch the real image and update
        if (token.uri) {
          const tokenImageBase64 = await getSVGfromMetadata(token.uri);
          if (tokenImageBase64) {
            token.image = tokenImageBase64;
            await snap.request({
              method: 'snap_updateInterface',
              params: {
                id,
                ui: <TokenDetails token={token} />,
              },
            });
          }
        }
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

          const userOwnsToken = await checkERC721Ownership(address, tokenId);
          if (!userOwnsToken) {
            await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: (
                  <Box>
                    <Heading>Token Not Owned</Heading>
                    <Text>
                      You don't own this NFT. Only tokens you own can be
                      imported.
                    </Text>
                  </Box>
                ),
              },
            });
            await returnToHomePage(id);
            return;
          }

          const erc721Info = await getERC721Details(address);
          if (address && tokenId) {
            await importToken(
              address,
              erc721Info?.name ?? `Token ${tokenId}`,
              erc721Info?.symbol ?? truncateAddress(address),
              '',
              tokenId,
            );
          }
          await recalculateBalances();
          await returnToHomePage(id);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'Token already exists'
          ) {
            await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: (
                  <Box>
                    <Heading>Duplicate Token</Heading>
                    <Text>This token is already in your list.</Text>
                  </Box>
                ),
              },
            });
            await returnToHomePage(id);
            return;
          }

          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <ImportERC721 errorInForm={true} errorType="general" />,
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
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === 'Token already exists'
          ) {
            await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: (
                  <Box>
                    <Heading>Duplicate Token</Heading>
                    <Text>This token is already in your list.</Text>
                  </Box>
                ),
              },
            });
            await returnToHomePage(id);
            return;
          }

          if (
            error instanceof Error &&
            error.message === 'Invalid token type'
          ) {
            await snap.request({
              method: 'snap_dialog',
              params: {
                type: 'alert',
                content: (
                  <Box>
                    <Heading>Invalid Token</Heading>
                    <Text>
                      The contract address provided is not a valid ERC20 token.
                    </Text>
                  </Box>
                ),
              },
            });
            await returnToHomePage(id);
            return;
          }

          await snap.request({
            method: 'snap_updateInterface',
            params: {
              id,
              ui: <ImportERC20 errorInForm={true} />,
            },
          });
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
  await checkChainId();

  const requestingOrigin = origin ?? 'Unknown origin';
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
              <Text>Request origin: {requestingOrigin}</Text>
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
              <Text>Request origin: {requestingOrigin}</Text>
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

    case 'build-it-uint256': {
      try {
        const params = request.params as
          | {
              value?: string;
              tokenAddress?: string;
              functionSelector?: string;
              chainId?: string;
              aesKey?: string;
            }
          | undefined;
        if (!params?.value || !params?.tokenAddress || !params?.functionSelector) {
          console.error('[snap] build-it-uint256: missing params', params);
          return null;
        }

        const state = await getStateByChainIdAndAddress(params.chainId);
        const aesKey = state.aesKey ?? params.aesKey ?? null;
        if (!aesKey) {
          console.error('[snap] build-it-uint256: AES key not found', {
            hasStateKey: Boolean(state.aesKey),
            hasParamKey: Boolean(params.aesKey),
            chainId: params.chainId,
          });
          return null;
        }

        const identifier = await getStateIdentifier({ requestAccounts: true });
        const chainId = params.chainId ?? identifier.chainId;
        const wallet = deriveSnapWallet(aesKey, identifier.address, chainId);

        console.info('[snap] build-it-uint256', {
          account: identifier.address,
          derivedSigner: wallet.address,
          chainId,
          token: params.tokenAddress,
          selector: params.functionSelector,
        });

        const itUint256 = buildItUint256(
          BigInt(params.value),
          aesKey,
          wallet,
          params.tokenAddress,
          params.functionSelector,
        );

        return {
          value: itUint256,
        };
      } catch (error) {
        console.error('[snap] build-it-uint256 failed', error);
        throw error;
      }
    }

    case 'debug-state':
      const allState = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      const debugChainIdHex = (await ethereum.request({
        method: 'eth_chainId',
      })) as string;
      const debugChainId = parseInt(debugChainIdHex, 16).toString();
      const debugExpectedEnv = await getExpectedEnvironment();
      return {
        currentChainId: debugChainId,
        currentChainIdHex: debugChainIdHex,
        expectedEnvironment: debugExpectedEnv,
        storedChainIds: allState ? Object.keys(allState as object) : [],
        fullState: allState,
      };

    case 'has-aes-key':
      const hasKeyParams = request.params as { chainId?: string } | undefined;
      const requestedChainId = hasKeyParams?.chainId;
      const currentState = await getStateByChainIdAndAddress(requestedChainId);
      if (currentState.aesKey) {
        return true;
      }

      return false;

    case 'get-aes-key':
      const getKeyParams = request.params as { chainId?: string } | undefined;
      const getRequestedChainId = getKeyParams?.chainId;
      const currentAESState =
        await getStateByChainIdAndAddress(getRequestedChainId);
      if (!currentAESState.aesKey) {
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

      if (currentAESState.aesKey) {
        const revealaesKey = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: (
              <Box>
                <Heading>Unlock Security Key</Heading>
                <Text>Approve to unlock your security key</Text>
                <Text>Request origin: {requestingOrigin}</Text>
              </Box>
            ),
          },
        });

        if (revealaesKey) {
          return currentAESState.aesKey;
        }
      }

      return null;

    case 'delete-aes-key':
      const deleteKeyParams = request.params as
        | { chainId?: string }
        | undefined;
      const deleteChainId = deleteKeyParams?.chainId;
      const currentDeleteState =
        await getStateByChainIdAndAddress(deleteChainId);
      if (!currentDeleteState.aesKey) {
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
              <Text>Request origin: {requestingOrigin}</Text>
            </Box>
          ),
        },
      });

      if (deleteResult) {
        await setStateByChainIdAndAddress(
          {
            ...currentDeleteState,
            aesKey: null,
          },
          deleteChainId,
        );
        return true;
      }

      return null;

    case 'set-aes-key':
      const { newUserAesKey, chainId: setChainId } = request.params as {
        newUserAesKey: string;
        chainId?: string;
      };
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

      const currentStateForSet = await getStateByChainIdAndAddress(setChainId);

      await setStateByChainIdAndAddress(
        {
          ...currentStateForSet,
          aesKey: newUserAesKey,
        },
        setChainId,
      );

      return true;

    case 'connect-to-wallet':
      await ethereum.request({ method: 'eth_requestAccounts' });
      return true;

    case 'get-permissions':
      try {
        const permissions = await ethereum.request({
          method: 'wallet_requestPermissions',
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
        return permissions ?? [];
      } catch (error) {
        return [];
      }

    case 'set-environment':
      const { environment } = request.params as {
        environment: 'testnet' | 'mainnet';
      };

      if (
        !environment ||
        (environment !== 'testnet' && environment !== 'mainnet')
      ) {
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Error</Heading>
                <Text>
                  Invalid environment. Must be 'testnet' or 'mainnet'.
                </Text>
              </Box>
            ),
          },
        });
        return false;
      }

      setEnvironment(environment);
      await setExpectedEnvironment(environment);
      return true;

    case 'check-account-permissions':
      try {
        const { targetAccount } =
          (request.params as { targetAccount?: string }) || {};

        const accounts = (await ethereum.request({
          method: 'eth_accounts',
        })) as string[];

        let currentAccount: string | null;
        if (targetAccount) {
          currentAccount = targetAccount.toLowerCase();
        } else {
          currentAccount =
            accounts.length > 0 ? accounts[0]?.toLowerCase() || null : null;
        }

        if (!currentAccount) {
          return {
            hasPermission: false,
            currentAccount: null,
            permittedAccounts: accounts,
            error: 'No active account found',
          };
        }

        const hasPermission = accounts.some(
          (account) => account.toLowerCase() === currentAccount,
        );
        const permittedAccounts = accounts;

        return {
          hasPermission,
          currentAccount,
          permittedAccounts,
        };
      } catch (error) {
        return {
          hasPermission: false,
          currentAccount: null,
          permittedAccounts: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

    case 'import-token':
      try {
        const importParams = request.params as {
          address: string;
          name: string;
          symbol: string;
          decimals: string;
          tokenType: 'ERC20' | 'ERC721' | 'ERC1155';
          tokenId?: string;
        };

        if (
          !importParams ||
          !importParams.address ||
          !importParams.name ||
          !importParams.symbol ||
          !importParams.tokenType
        ) {
          return { success: false, error: 'Missing required parameters' };
        }

        const {
          address: tokenAddress,
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          tokenType,
          tokenId,
        } = importParams;

        if (tokenType === 'ERC20') {
          const isUnique = await checkIfERC20Unique(tokenAddress);
          if (!isUnique) {
            return { success: true, alreadyExists: true };
          }
        } else if (tokenId) {
          const isUnique = await checkIfERC721Unique(tokenAddress, tokenId);
          if (!isUnique) {
            return { success: true, alreadyExists: true };
          }
        }

        await importToken(
          tokenAddress,
          tokenName,
          tokenSymbol,
          tokenDecimals || '0',
          tokenId,
          tokenType,
        );

        await recalculateBalances();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

    case 'hide-token':
      try {
        const hideParams = request.params as {
          address: string;
          tokenId?: string;
        };

        if (!hideParams || !hideParams.address) {
          return { success: false, error: 'Missing token address' };
        }

        await hideToken(hideParams.address, hideParams.tokenId);
        await recalculateBalances();

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

    case 'get-tokens':
      try {
        const getTokensParams = request.params as
          | { chainId?: string }
          | undefined;
        const tokenState = await getStateByChainIdAndAddress(
          getTokensParams?.chainId,
        );
        const allTokens = tokenState.tokenBalances || [];
        return {
          success: true,
          tokens: allTokens.map((t) => ({
            address: t.address,
            name: t.name,
            symbol: t.symbol,
            decimals: t.decimals,
            type: t.type === TokenViewSelector.NFT ? 'ERC721' : 'ERC20',
            tokenId: t.tokenId ?? undefined,
          })),
        };
      } catch (error) {
        return {
          success: false,
          tokens: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

    default:
      throw new Error('Method not found.');
  }
};
