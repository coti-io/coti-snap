import { useRequestSnap } from '../hooks';
import { Button } from './Button';
import { ContentContainer, ContentText, ContentTitle } from './styles';

export const ContentInstallAESKeyManager = () => {
  const requestSnap = useRequestSnap();
  return (
    <ContentContainer>
      <ContentTitle>Install AES Key manager</ContentTitle>
      <ContentText>
        Please install AES Key manager to start your account onboarding.
      </ContentText>

      <Button text="Install manager" primary onClick={requestSnap} />
    </ContentContainer>
  );
};
