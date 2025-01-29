# COTI AES key manager

This part of repository contains the COTI AES key manager.

COTI AES key manager is a Metamask extension that allows you to:
- View your private tokens (erc20 and erc721).
- Encrypt and decrypt data.
- Manage your AES key,

## How to use it in your dapp

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

## Getting Started

```shell
yarn install
yarn start
```

## Testing

To test the snap, run `yarn test` in this directory.
