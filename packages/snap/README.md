# COTI AES key manager

This part of repository contains the COTI AES key manager.

COTI AES key manager is a Metamask extension that allows you to:
- View your private tokens (erc20 and erc721).
- Encrypt and decrypt data.
- Manage your AES key,



## For users

### How to install it

Go to COTI AES key manager Companion dapp to install it in your Metamask wallet.

### How to use it

#### Generate AES key

1. Once installed you can view it in Metamask > Menu (the three dots on the top right) > Snaps > COTI.

2. You will need to generate your AES key to be able to see the tokens you add, to do this click on `Onboard account`, this will redirect you to the dapp companion.

3. Once in the dapp, you will be able to generate your AES key, you will need to connect to wallet and switch to the COTI network to generate it.

4. Once generated, you will be able to view or delete it from the dapp companion.

#### View AES key

1. Once generated you can consult the EAS key manager to obtain it, for this go to companion dapp or go to Metamask > Menu (the three dots on the top right) > Snaps > COTI > COTI Companion Dapp > Go to comanion dapp.

2. Once in the companion dapp, click on Reveal AES Key, this will ask you to sign in to query the manager for the key.

3. Once obtained, you can copy it by clicking on the “copy” icon to the right of the input, once copied it will be hidden again, but you can request it again as many times as you want. 

#### Add token

1. Select in the tabs the type of token, (Tokens / NFT).

2. Click on `add token`.

3. If you are adding a token (erc20), add the contract address of the token, if the token is in the COTI network, the other data will be added automatically, otherwise the missing data will be added.

  If you are adding an NFT (erc721), add the NFT contract address and the token ID.

4. You are done! The token will appear in the COTI AES key manager home.

## For devs

### How to use it in your dapp

0. This assumes you have COTI AES key manager installed on your Memamask, if not, you can add it from here.

1. Add `@metamask/providers` to your dapp.

```shell
yarn add @metamask/providers
```

2. Create a function to detect if the user has Metamask to use it as a provider. You can guide yourself with [this repo](https://github.com/MetaMask/template-snap-monorepo/blob/main/packages/site/src/utils/metamask.ts).

3. Create a `MetaMaskProvider` in your dapp, which will let us know if COTI AES key manager is installed in the user's wallet. You can guide yourself with [this repo](https://github.com/MetaMask/template-snap-monorepo/blob/main/packages/site/src/hooks/MetamaskContext.tsx).

4. Create the `useRequest` hook to interact with Metamask. You can guide yourself with [this repo](https://github.com/MetaMask/template-snap-monorepo/blob/main/packages/site/src/hooks/useRequest.ts).

5. Now, create a hook called `useInvokeKeyManager` to invoke the COTI AES key manager.

```
export type InvokeKeyManagerParams = {
  method: string;
  params?: Record<string, unknown>;
};

export const useInvokeKeyManager = (snapId) => {
  const request = useRequest();

  /**
   * Invoke the requested method.
   *
   * @param params - The invoke params.
   * @param params.method - The method name.
   * @param params.params - The method params.
   * @returns The response.
   */
  const invokeKeyManager = async ({ method, params }: InvokeKeyManagerParams) =>
    request({
      method: 'wallet_invokeSnap',
      params: {
        snapId,
        request: params ? { method, params } : { method },
      },
    });

  return invokeKeyManager;
};
```

6. (Optional) You can also create a hook that detects if COTI AES key manager is installed or not.

```
export const useMetaMask = () => {
  const { provider, setInstalledSnap, installedSnap } = useMetaMaskContext();
  const request = useRequest();

    /**
   * Get the Snap informations from MetaMask.
   */
  const getSnap = async () => {
    const snaps = (await request({
      method: 'wallet_getSnaps',
    })) as GetSnapsResponse;

    setInstalledSnap(snaps[defaultSnapOrigin] ?? null);
  };

  useEffect(() => {
    const detect = async () => {
      if (provider) {
        await getSnap();
      }
    };

    detect().catch(console.error);
  }, [provider]);

  return { installedSnap, getSnap };
};
```

7. Done! Now if you want to encrypt or decrypt some data from your dapp, you can use something like this:

To encrypt
```
  const handleEncryptClick = async () => {
    const result = await invokeSnap({
      method: 'encrypt',
      params: { value: 'hello' },
    });
    if (result) {
      alert(result);
    }
  };
```

To decrypt
```
  const handleDecryptClick = async () => {
    const result = await invokeSnap({
      method: 'decrypt',
      params: {
        value: JSON.stringify({
          ciphertext: new Uint8Array([
            230, 250, 246, 145, 200, 66, 40, 179, 108, 187, 128, 135, 216, 44,
            32, 48,
          ]),
          r: new Uint8Array([
            67, 194, 73, 74, 131, 182, 125, 200, 112, 210, 211, 145, 192, 148,
            187, 11,
          ]),
        }),
      },
    });
    console.log('result', result);
    if (result) {
      alert(result);
    }
  };
```

### More info

If you need more information you can check the [Metamask documentation](https://docs.metamask.io/snaps/).

### Getting Started

```shell
yarn install
yarn start
```

### Testing

To test the snap, run `yarn test` in this directory.
