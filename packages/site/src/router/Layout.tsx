import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { Header } from '../components';

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: transparent;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  margin-top: 80px;
  padding-top: 24px;
  gap: 24px;
  box-sizing: border-box;
  background: transparent;

  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 16px;
    margin-top: 70px;
    padding-top: 16px;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

/**
 *
 * @param options0
 * @param options0.children
 */
export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <Header />
      <Container>
        {children}
        <Outlet />
      </Container>
    </LayoutWrapper>
  );
}
