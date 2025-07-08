import { useState } from 'react';
import Metamask from '../assets/metamask_fox.svg';
import { useRequestSnap, useMetaMask } from '../hooks';
import { Button } from './Button';
import { ContentContainer, ContentText, ContentTitle } from './styles';

export const ContentInstallAESKeyManager = () => {
  const requestSnap = useRequestSnap();
  const { getSnap } = useMetaMask();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallSnap = async () => {
    try {
      setIsInstalling(true);
      await requestSnap();
      // Refresh snap status after installation
      await getSnap();
    } catch (error) {
      console.error('Failed to install snap:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <ContentContainer>
      <ContentTitle>Install the COTI MetaMask Snap</ContentTitle>
      <ContentText>
        Please install the COTI MetaMask snap to onboard your account. If you
        don't have the COTI snap installed you will be prompted to install it.
      </ContentText>

      <Button
        text={isInstalling ? "Installing..." : "Install with MetaMask"}
        primary
        onClick={handleInstallSnap}
        disabled={isInstalling}
        icon={<Metamask />}
      />
    </ContentContainer>
  );
};
