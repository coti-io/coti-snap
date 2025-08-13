import { useInvokeSnap, useMetaMask, useRequestSnap } from '../hooks';
import { shouldDisplayReconnectButton } from '../utils';
import { Button } from './Button';
import { ContentBorderWrapper, ContentContainer } from './styles';

export const TestContent = ({ userAESKey }: { userAESKey: string | null }) => {
  const { installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const handleEncryptClick = async () => {
    const result = await invokeSnap({
      method: 'encrypt',
      params: { value: 'hello' },
    });
    if (result) {
      alert(result);
    }
  };

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
    if (result) {
      alert(result);
    }
  };

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        {userAESKey && <div>{userAESKey}</div>}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Button primary text="Reconnect" onClick={requestSnap} />
        )}
        {installedSnap && (
          <>
            <Button primary text="Encrypt" onClick={handleEncryptClick} />
            <Button primary text="Decrypt" onClick={handleDecryptClick} />
          </>
        )}
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
