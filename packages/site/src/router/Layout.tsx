import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import { Header } from '../components';
import { Chain } from '../components/Header/Chain';

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: transparent;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 80px;

  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 70px;
  }
`;

const ChainIndicator = styled.div`
  width: 564px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 12px;
  box-sizing: border-box;
  min-height: 40px;

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 0 16px 12px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 564px;
  height: 100%;
  padding-top: 24px;
  gap: 24px;
  box-sizing: border-box;
  background: transparent;

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 16px;
    padding-top: 16px;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

export function Layout({ children }: { children?: React.ReactNode }) {
  const { isConnected } = useAccount();

  return (
    <LayoutWrapper>
      <Header />
      <ContentWrapper>
        <ChainIndicator>
          {isConnected && <Chain />}
        </ChainIndicator>
        <Container>
          {children}
          <Outlet />
        </Container>
      </ContentWrapper>
    </LayoutWrapper>
  );
}