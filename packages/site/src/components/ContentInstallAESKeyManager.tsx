import { useCallback, useTransition } from 'react';
import styled, { keyframes } from 'styled-components';

import { ButtonAction } from './Button';
import {
  ContentBorderWrapper,
  ContentContainer,
  ContentTextInstall,
  ContentTitle,
} from './styles';
import Metamask from '../assets/metamask_fox.svg';
import SpinnerIcon from '../assets/spinner.png';
import { useRequestSnap, useMetaMask } from '../hooks';

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

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #1e29f6;
  border-radius: 12px;
  padding: 16px;
`;

const InfoIcon = styled.span`
  font-size: 16px;
  line-height: 1.4;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const InfoText = styled.span`
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
`;

export const ContentInstallAESKeyManager = () => {
  const snapVersion = process.env.VITE_SNAP_VERSION;
  const requestSnap = useRequestSnap(undefined, snapVersion);
  const { getSnap, isInstallingSnap } = useMetaMask();
  const [isPending, startTransition] = useTransition();

  const handleInstallSnap = useCallback(async () => {
    try {
      startTransition(() => {
        // This will make the navigation and subsequent re-renders non-blocking
      });

      await requestSnap();

      await new Promise((resolve) => setTimeout(resolve, 100));

      await getSnap();
    } catch (error) {
      void error;
    }
  }, [requestSnap, getSnap]);

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Install</ContentTitle>
        <ContentTextInstall>
          Click on the Install with MetaMask button to continue with the Snap
          installation. Using the snap you can onboard your AES key and access
          COTI's privacy-centric experience across different dApps.
        </ContentTextInstall>

        <InfoBox>
          <InfoIcon>💡</InfoIcon>
          <InfoContent>
            <InfoTitle>Multiple accounts?</InfoTitle>
            <InfoText>
              When MetaMask prompts you to connect, select all the accounts you
              want to use with the Snap. To add more accounts later, you'll need
              to reinstall the Snap.
            </InfoText>
          </InfoContent>
        </InfoBox>

        <ButtonAction
          text={
            isInstallingSnap || isPending
              ? 'Installing'
              : 'Install with MetaMask'
          }
          primary
          onClick={handleInstallSnap}
          disabled={isInstallingSnap || isPending}
          iconLeft={
            isInstallingSnap || isPending ? (
              <SpinnerImage src={SpinnerIcon} alt="Loading" />
            ) : undefined
          }
          iconRight={<Metamask />}
        />
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
