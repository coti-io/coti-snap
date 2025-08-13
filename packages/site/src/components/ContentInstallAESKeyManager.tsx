import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Metamask from '../assets/metamask_fox.svg';
import SpinnerIcon from '../assets/spinner.png';
import { useRequestSnap, useMetaMask } from '../hooks';
import { ButtonAction } from './Button';
import { ContentBorderWrapper, ContentContainer, ContentTextInstall, ContentTitle } from './styles';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerImage = styled.img`
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
`;

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
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Install the COTI MetaMask Snap</ContentTitle>
        <ContentTextInstall>
          Please install the COTI MetaMask snap to onboard your account. If you
          don't have the COTI snap installed you will be prompted to install it.
        </ContentTextInstall>

        <ButtonAction
          text={isInstalling ? "Installing" : "Install with MetaMask"}
          primary
          onClick={handleInstallSnap}
          disabled={isInstalling}
          iconLeft={isInstalling ? <SpinnerImage src={SpinnerIcon} alt="Loading" /> : undefined}
          iconRight={<Metamask />}
        />
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
