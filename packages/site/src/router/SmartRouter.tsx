import { useCallback, useEffect, useState, useTransition } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styled from 'styled-components';

import { useMetaMask, useWrongChain } from '../hooks';
import { useSnap } from '../hooks/SnapContext';
import { Header } from '../components';
import { Chain } from '../components/Header/Chain';
import { Footer } from '../components/Footer';
import { Loading } from '../components/Loading';
import { ButtonAction } from '../components/Button';
import { ContentBorderWrapper, ContentContainer, ContentText, ContentTitle } from '../components/styles';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  max-height: 100vh;
  max-height: calc(100vh - 120px);
  gap: 24px;
  box-sizing: border-box;
  border-radius: 14px;
  background: transparent;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 1.6rem;
    margin: 0;
    max-width: 100vw;
    box-sizing: border-box;
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
`;

export function SmartRouter() {
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();
  const { installedSnap, isInstallingSnap, snapsDetected, hasCheckedForProvider } = useMetaMask();
  const { isInitializing } = useSnap();
  const navigate = useNavigate();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [, startTransition] = useTransition();
  const shouldShowInstallModal = hasCheckedForProvider && !snapsDetected;
  const handleInstallMetaMask = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open('https://metamask.io/download.html', '_blank', 'noopener,noreferrer');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;

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

      if (installedSnap && !isOnProtectedRoute && 
          (currentPath === '/' || currentPath === '/connect' || currentPath === '/network' || currentPath === '/install')) {
        setTimeout(() => {
          navigate('/wallet', { replace: true });
        }, isInstallingSnap ? 500 : 0);
      }
    });
  }, [hasInitialized, isConnected, wrongChain, installedSnap, isInstallingSnap, navigate]);

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
            <ContentTitle>It looks like MetaMask isn&apos;t installed.</ContentTitle>
            <ContentText>
              Install MetaMask to continue using the COTI dApp. Once you have it, refresh this page and we&apos;ll take you straight to the next step.
            </ContentText>
            <InstallActions>
              <ButtonAction text="Install MetaMask" onClick={handleInstallMetaMask} />
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
