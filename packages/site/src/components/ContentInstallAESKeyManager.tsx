import Metamask from '../assets/metamask_fox.svg';
import { useRequestSnap } from '../hooks';
import { Button } from './Button';
import { ContentContainer, ContentText, ContentTitle } from './styles';

export const ContentInstallAESKeyManager = () => {
  const requestSnap = useRequestSnap();
  return (
    <ContentContainer>
      <ContentTitle>Install the COTI MetaMask Snap</ContentTitle>
      <ContentText>
        Please install the COTI MetaMask snap to onboard your account. If you
        don't have the COTI snap installed you will be prompted to install it.
      </ContentText>

      <Button
        text="Install with MetaMask"
        primary
        onClick={requestSnap}
        icon={<Metamask />}
      />
    </ContentContainer>
  );
};
