import { decrypt, encodeKey } from '@coti-io/coti-sdk-typescript';
import { installSnap } from '@metamask/snaps-jest';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';
import type { SnapConfirmationInterface } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('handles encryption with a valid AES key', async () => {
    const { request } = await installSnap();
    const aesKey = 'test-aes-key';

    await request({
      method: 'set-aes-key',
      params: { newUserAesKey: aesKey },
    });

    const textToEncrypt = 'Hello, encrypt!';
    const response = request({
      method: 'encrypt',
      params: { value: textToEncrypt },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Would you like to encrypt this value?</Heading>
        <Text>Value to encrypt: "{textToEncrypt}"</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response as { response: { result: string } };
    expect(rpcResponse).toRespondWith(expect.any(String));
    expect(rpcResponse.response.result).toBeDefined();

    const result = rpcResponse.response.result;
    const r = JSON.parse(result).r as Object
    const ciphertext = JSON.parse(result).ciphertext as Object
    const decryptResult = decrypt(encodeKey(aesKey), new Uint8Array([...Object.values(r)]), new Uint8Array([...Object.values(ciphertext)]))
    const decoder = new TextDecoder('utf-8');
    const decodedString = decoder.decode(decryptResult).replace(/^\u0000+/, '');

    expect(decodedString).toBe(textToEncrypt);
  });

  it('handles decryption with a valid AES key', async () => {
    const { request } = await installSnap();
    const aesKey = 'test-aes-key';

    // encrypted string of "Hello, encrypt!"
    const encryptedValue = `{"ciphertext":{"0":200,"1":164,"2":9,"3":14,"4":128,"5":3,"6":140,"7":76,"8":179,"9":61,"10":14,"11":109,"12":166,"13":242,"14":167,"15":210},"r":{"0":255,"1":18,"2":79,"3":60,"4":244,"5":42,"6":201,"7":192,"8":146,"9":103,"10":201,"11":91,"12":51,"13":91,"14":169,"15":84}}`;

    // Ensure the AES key is set
    await request({
      method: 'set-aes-key',
      params: { newUserAesKey: aesKey },
    });

    const response = request({
      method: 'decrypt',
      params: { value: encryptedValue },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Would you like to decrypt this value?</Heading>
        <Text>Value to decrypt: "{encryptedValue}"</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    expect(rpcResponse).toBeDefined();

    const result = (rpcResponse.response as { result: string }).result;
    const decryptResult = new Uint8Array([...Object.values(JSON.parse(result) as Object)]);
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
    const result = (rpcResponse.response as { result: null }).result;
    expect(result).toBeNull();
  });

  it('handles fetching the AES key', async () => {
    const { request } = await installSnap();
    const aesKey = 'test-aes-key';

    await request({
      method: 'set-aes-key',
      params: { newUserAesKey: aesKey },
    });

    const response = request({
      method: 'get-aes-key',
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;
    expect(ui.type).toBe('confirmation');
    expect(ui).toRender(
      <Box>
        <Heading>Reveal AES Key</Heading>
        <Text>Approve to reveal AES Key</Text>
      </Box>,
    );

    await ui.ok();
    const rpcResponse = await response;
    const result = (rpcResponse.response as { result: string }).result;
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
});
