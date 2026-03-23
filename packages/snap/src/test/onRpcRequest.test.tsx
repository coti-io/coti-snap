import {
  decrypt,
  encodeKey,
  encrypt,
  encodeString,
} from '@coti-io/coti-sdk-typescript';
import { installSnap } from '@metamask/snaps-jest';
import type { SnapConfirmationInterface } from '@metamask/snaps-jest';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';

const AUTHORIZED_SET_KEY_ORIGIN = 'https://metamask.coti.io';
const TEST_AES_KEY = '00112233445566778899aabbccddeeff';

const setAesKeyWithConfirmation = async (request: any, aesKey = TEST_AES_KEY) => {
  const response = request({
    method: 'set-aes-key',
    params: { newUserAesKey: aesKey },
    origin: AUTHORIZED_SET_KEY_ORIGIN,
  });

  const ui = (await response.getInterface()) as SnapConfirmationInterface;
  expect(ui.type).toBe('confirmation');
  await ui.ok();
  await response;
};

describe('onRpcRequest', () => {
  it('handles encryption with a valid AES key', async () => {
    const { request } = await installSnap();
    const aesKey = TEST_AES_KEY;
    const origin = 'https://example-dapp.io';

    await setAesKeyWithConfirmation(request, aesKey);

    const textToEncrypt = 'Hello, encrypt!';
    const response = request({
      method: 'encrypt',
      params: { value: textToEncrypt },
      origin,
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Would you like to encrypt this value?</Heading>
        <Text>Value to encrypt: "{textToEncrypt}"</Text>
        <Text>Request origin: {origin}</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = (await response) as { response: { result: string } };
    expect(rpcResponse).toRespondWith(expect.any(String));
    expect(rpcResponse.response.result).toBeDefined();

    const { result } = rpcResponse.response;
    const r = JSON.parse(result).r as Object;
    const ciphertext = JSON.parse(result).ciphertext as Object;
    const decryptResult = decrypt(
      encodeKey(aesKey),
      new Uint8Array([...Object.values(r)]),
      new Uint8Array([...Object.values(ciphertext)]),
    );
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(decryptResult).replace(/^\u0000+/, '');

    expect(decodedString).toBe(textToEncrypt);
  });

  it('handles decryption with a valid AES key', async () => {
    const { request } = await installSnap();
    const aesKey = TEST_AES_KEY;
    const origin = 'https://example-dapp.io';

    const encryptedValue = JSON.stringify(
      encrypt(encodeKey(aesKey), encodeString('Hello, encrypt!')),
    );

    await setAesKeyWithConfirmation(request, aesKey);

    const response = request({
      method: 'decrypt',
      params: { value: encryptedValue },
      origin,
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Would you like to decrypt this value?</Heading>
        <Text>Value to decrypt: "{encryptedValue}"</Text>
        <Text>Request origin: {origin}</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    expect(rpcResponse).toBeDefined();

    const { result } = rpcResponse.response as { result: string };
    const decryptResult = new Uint8Array([
      ...Object.values(JSON.parse(result) as Object),
    ]);
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(decryptResult).replace(/^\u0000+/, '');
    expect(decodedString).toBe('Hello, encrypt!');
  });

  it('throws an error if AES key is not set for encryption', async () => {
    const { request } = await installSnap();
    const textToEncrypt = 'Hello, world!';

    const response = request({
      method: 'encrypt',
      params: { value: textToEncrypt },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('alert');
    expect(ui).toRender(
      <Box>
        <Heading>Warning</Heading>
        <Text>Cannot encrypt value. AES key not found.</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    const { result } = rpcResponse.response as { result: null };
    expect(result).toBeNull();
  });

  it('handles fetching the AES key', async () => {
    const { request } = await installSnap();
    const aesKey = TEST_AES_KEY;
    const origin = 'https://example-dapp.io';

    await setAesKeyWithConfirmation(request, aesKey);

    const response = request({
      method: 'get-aes-key',
      origin,
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Share Raw AES Encryption Key</Heading>
        <Text>
          This will share your raw AES encryption key with the requesting
          website.
        </Text>
        <Text>
          This key can decrypt all your confidential balances and transactions.
        </Text>
        <Text>Request origin: {origin}</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    const { result } = rpcResponse.response as { result: string };
    expect(result).toBe(aesKey);
  });

  it('throws an error for unknown methods', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'unknown-method',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Method not found.',
      stack: expect.any(String),
    });
  });

  it('checks if AES key exists', async () => {
    const { request } = await installSnap();

    const responseWithoutKey = await request({
      method: 'has-aes-key',
    });

    expect(responseWithoutKey).toRespondWith(false);

    await setAesKeyWithConfirmation(request);

    const responseWithKey = await request({
      method: 'has-aes-key',
    });

    expect(responseWithKey).toRespondWith(true);
  });

  it('deletes AES key with user confirmation', async () => {
    const { request } = await installSnap();
    const aesKey = TEST_AES_KEY;
    const origin = 'https://example-dapp.io';

    await setAesKeyWithConfirmation(request, aesKey);

    const hasKeyBefore = await request({
      method: 'has-aes-key',
    });
    expect(hasKeyBefore).toRespondWith(true);

    const deleteResponse = request({
      method: 'delete-aes-key',
      origin,
    });

    const ui =
      (await deleteResponse.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Delete AES Key</Heading>
        <Text>Approve to delete the AES Key</Text>
        <Text>Request origin: {origin}</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await deleteResponse;
    expect(rpcResponse).toRespondWith(true);

    const hasKeyAfter = await request({
      method: 'has-aes-key',
    });
    expect(hasKeyAfter).toRespondWith(false);
  });

  it('handles delete AES key when no key exists', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'delete-aes-key',
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('alert');
    expect(ui).toRender(
      <Box>
        <Heading>Warning</Heading>
        <Text>AES key not found.</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    const { result } = rpcResponse.response as { result: null };
    expect(result).toBeNull();
  });

  it('handles user rejection when deleting AES key', async () => {
    const { request } = await installSnap();
    await setAesKeyWithConfirmation(request);

    const deleteResponse = request({
      method: 'delete-aes-key',
    });

    const ui =
      (await deleteResponse.getInterface()) as SnapConfirmationInterface;
    await ui.cancel();

    const rpcResponse = await deleteResponse;
    const { result } = rpcResponse.response as { result: null };
    expect(result).toBeNull();

    const hasKey = await request({
      method: 'has-aes-key',
    });
    expect(hasKey).toRespondWith(true);
  });

  it('connects to wallet successfully', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'connect-to-wallet',
    });

    expect(response).toRespondWith(true);
  });

  it('gets wallet permissions', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'get-permissions',
    });

    expect(response).toRespondWith([]);
  });

  it('sets environment to testnet', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'set-environment',
      params: { environment: 'testnet' },
    });

    expect(response).toRespondWith(true);
  });

  it('sets environment to mainnet', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'set-environment',
      params: { environment: 'mainnet' },
    });

    expect(response).toRespondWith(true);
  });

  it('handles invalid environment parameter', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'set-environment',
      params: { environment: 'invalid-env' },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('alert');
    expect(ui).toRender(
      <Box>
        <Heading>Error</Heading>
        <Text>Invalid environment. Must be 'testnet' or 'mainnet'.</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    expect(rpcResponse).toRespondWith(false);
  });

  it('handles missing environment parameter', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'set-environment',
      params: {},
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('alert');
    expect(ui).toRender(
      <Box>
        <Heading>Error</Heading>
        <Text>Invalid environment. Must be 'testnet' or 'mainnet'.</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    expect(rpcResponse).toRespondWith(false);
  });

  it('checks account permissions for current account', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'check-account-permissions',
    });

    expect(response.response).toHaveProperty('result');
    const result = (response.response as { result: any }).result as {
      hasPermission: boolean;
      currentAccount: string | null;
      permittedAccounts: string[];
    };

    expect(result).toHaveProperty('hasPermission');
    expect(result).toHaveProperty('currentAccount');
    expect(result).toHaveProperty('permittedAccounts');
    expect(Array.isArray(result.permittedAccounts)).toBe(true);
  });

  it('checks account permissions for specific target account', async () => {
    const { request } = await installSnap();
    const targetAccount = '0x1234567890123456789012345678901234567890';

    const response = await request({
      method: 'check-account-permissions',
      params: { targetAccount },
    });

    expect(response.response).toHaveProperty('result');
    const result = (response.response as { result: any }).result as {
      hasPermission: boolean;
      currentAccount: string | null;
      permittedAccounts: string[];
    };

    expect(result).toHaveProperty('hasPermission');
    expect(result).toHaveProperty('currentAccount');
    expect(result).toHaveProperty('permittedAccounts');
    expect(result.currentAccount).toBe(targetAccount.toLowerCase());
  });

  it('handles account permissions check errors gracefully', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'check-account-permissions',
    });

    expect(response.response).toHaveProperty('result');
    const result = (response.response as { result: any }).result as {
      hasPermission: boolean;
      currentAccount: string | null;
      permittedAccounts: string[];
      error?: string;
    };

    expect(result).toHaveProperty('hasPermission');
    expect(result).toHaveProperty('currentAccount');
    expect(result).toHaveProperty('permittedAccounts');
    expect(typeof result.hasPermission).toBe('boolean');
  });
});
