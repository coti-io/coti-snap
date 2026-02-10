import { useCallback, useEffect, useState, useTransition } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import { Header } from '../components';
import { ButtonAction } from '../components/Button';
import { Footer } from '../components/Footer';
import { Chain } from '../components/Header/Chain';
import { Loading } from '../components/Loading';
import {
  ContentBorderWrapper,
  ContentContainer,
  ContentText,
  ContentTitle,
} from '../components/styles';
import { useMetaMask, useWrongChain } from '../hooks';
import { useSnap } from '../hooks/SnapContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  max-height: 100vh;
  max-height: calc(100vh - clamp(96px, 12vh, 120px));
  padding-bottom: clamp(96px, 12vh, 120px);
  gap: clamp(12px, 2vh, 24px);
  box-sizing: border-box;
  border-radius: 14px;
  background: transparent;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 0 1.6rem;
    padding-bottom: calc(clamp(96px, 12vh, 120px) + 1.6rem);
    margin: auto;
    max-width: 100vw;
    box-sizing: border-box;
  }

  @media screen and (max-width: 768px), screen and (max-height: 700px) {
    max-height: calc(100vh - clamp(96px, 12vh, 96px));
    padding-bottom: clamp(96px, 12vh, 96px);
  }
`;

const InstallActions = styled.div`
  display: flex;
  justify-content: center;
`;

const ChainIndicator = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  box-sizing: border-box;
  position: relative;
  z-index: 900;

  @media screen and (max-width: 770px) {
    display: none;
  }
`;

const MobileNoticeIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: rgba(255, 0, 0, 0.15);
  color: #d24745;
  font-size: 26px;
  font-weight: bold;
  margin: 0 auto;
`;

const MobileNoticeStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

/**
 *
 */
export function SmartRouter() {
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();
  const {
    installedSnap,
    isInstallingSnap,
    snapsDetected,
    hasCheckedForProvider,
  } = useMetaMask();
  const { isInitializing } = useSnap();
  const navigate = useNavigate();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, startTransition] = useTransition();
  const shouldShowInstallModal = hasCheckedForProvider && !snapsDetected;
  const handleInstallMetaMask = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(
        'https://metamask.io/download.html',
        '_blank',
        'noopener,noreferrer',
      );
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasInitialized || isMobile) {
      return;
    }

    const currentPath = window.location.pathname;

    const protectedRoutes = ['/wallet', '/tokens'];
    const isOnProtectedRoute = protectedRoutes.includes(currentPath);

    startTransition(() => {
      if (!isConnected) {
        navigate('/connect', { replace: true });
        return;
      }

      if (wrongChain) {
        navigate('/network', { replace: true });
        return;
      }

      if (!installedSnap && !isInstallingSnap) {
        navigate('/install', { replace: true });
        return;
      }

      if (
        installedSnap &&
        !isOnProtectedRoute &&
        (currentPath === '/' ||
          currentPath === '/connect' ||
          currentPath === '/network' ||
          currentPath === '/install')
      ) {
        setTimeout(
          () => {
            navigate('/wallet', { replace: true });
          },
          isInstallingSnap ? 500 : 0,
        );
      }
    });
  }, [
    hasInitialized,
    isMobile,
    isConnected,
    wrongChain,
    installedSnap,
    isInstallingSnap,
    navigate,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const ua = navigator.userAgent || navigator.vendor || '';
    const nav = navigator as Navigator & {
      userAgentData?: { mobile?: boolean };
    };
    const isUaMobile =
      typeof nav.userAgentData?.mobile === 'boolean'
        ? nav.userAgentData.mobile
        : /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini|Windows Phone/i.test(
            ua,
          );
    setIsMobile(isUaMobile);
  }, []);

  if (isMobile) {
    return (
      <Container>
        <Header />
        <ContentBorderWrapper>
          <ContentContainer>
            <MobileNoticeStack>
              <MobileNoticeIcon>X</MobileNoticeIcon>
              <ContentTitle>Mobile Not Supported</ContentTitle>
              <ContentText>
                The COTI Metamask Snap dApp requires wallet capabilities that
                are not available on mobile devices. Please open this page on a
                desktop browser with a supported wallet.
              </ContentText>
            </MobileNoticeStack>
          </ContentContainer>
        </ContentBorderWrapper>
        <Footer />
      </Container>
    );
  }

  if (isInitializing) {
    return (
      <Container>
        <Header />
        <ContentBorderWrapper>
          <ContentContainer>
            <Loading title="Loading..." actionText="" />
          </ContentContainer>
        </ContentBorderWrapper>
        <Footer />
      </Container>
    );
  }

  if (shouldShowInstallModal) {
    return (
      <Container>
        <Header />
        <ContentBorderWrapper>
          <ContentContainer>
            <ContentTitle>
              It looks like MetaMask isn&apos;t installed.
            </ContentTitle>
            <ContentText>
              Install MetaMask to continue using the COTI dApp. Once you have
              it, refresh this page and we&apos;ll take you straight to the next
              step.
            </ContentText>
            <InstallActions>
              <ButtonAction
                text="Install MetaMask"
                onClick={handleInstallMetaMask}
              />
            </InstallActions>
          </ContentContainer>
        </ContentBorderWrapper>
        <Footer />
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      {isConnected && (
        <ChainIndicator>
          <Chain />
        </ChainIndicator>
      )}
      <Outlet />
      <Footer />
    </Container>
  );
}
