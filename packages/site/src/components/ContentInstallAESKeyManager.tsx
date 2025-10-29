import { useCallback, useTransition } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAccount } from 'wagmi';

import Metamask from '../assets/metamask_fox.svg';
import SpinnerIcon from '../assets/spinner.png';
import { useRequestSnap, useMetaMask } from '../hooks';
import { getNetworkConfig, isSupportedChainId } from '../config/networks';
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
  const { chain } = useAccount();
  const isTestnetNetwork =
    typeof chain?.id === 'number' && isSupportedChainId(chain.id)
      ? getNetworkConfig(chain.id).isTestnet
      : false;

  const snapVersion = isTestnetNetwork ? undefined : import.meta.env.VITE_SNAP_VERSION;
  const requestSnap = useRequestSnap(undefined, snapVersion);
  const { getSnap, isInstallingSnap } = useMetaMask();
  const [isPending, startTransition] = useTransition();

  const handleInstallSnap = useCallback(async () => {
    try {
      startTransition(() => {
        // This will make the navigation and subsequent re-renders non-blocking
      });
      
      await requestSnap();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await getSnap();
    } catch (error) {
      console.error('Failed to install snap:', error);
    }
  }, [requestSnap, getSnap]);

  return (
    <ContentBorderWrapper>
      <ContentContainer>
        <ContentTitle>Install</ContentTitle>
        <ContentTextInstall>
        Click on the Install with Metamask to continue with the Snap installation, using the snap you could onboard your AES key and use different dApps and COTI privacy centric experience!
        </ContentTextInstall>

        <ButtonAction
          text={isInstallingSnap || isPending ? "Installing" : "Install with MetaMask"}
          primary
          onClick={handleInstallSnap}
          disabled={isInstallingSnap || isPending}
          iconLeft={isInstallingSnap || isPending ? <SpinnerImage src={SpinnerIcon} alt="Loading" /> : undefined}
          iconRight={<Metamask />}
        />
      </ContentContainer>
    </ContentBorderWrapper>
  );
};
