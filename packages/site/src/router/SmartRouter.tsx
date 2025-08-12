import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import styled from 'styled-components';

import { useMetaMask, useWrongChain } from '../hooks';
import { Header } from '../components';

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

export function SmartRouter() {
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();
  const { installedSnap } = useMetaMask();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) {
      navigate('/connect', { replace: true });
      return;
    }

    if (wrongChain) {
      navigate('/network', { replace: true });
      return;
    }

    if (!installedSnap) {
      navigate('/install', { replace: true });
      return;
    }

    const currentPath = window.location.pathname;
    if (currentPath === '/connect' || currentPath === '/network' || currentPath === '/install' || currentPath === '/') {
      navigate('/wallet', { replace: true });
    }
  }, [isConnected, wrongChain, installedSnap, navigate]);

  return (
    <Container>
      <Header />
      <Outlet />
    </Container>
  );
}