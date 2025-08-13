import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { Header } from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 564px;
  height: 100%;
  max-height: 100vh;
  margin-top: 20px;
  max-height: calc(100vh - 120px);
  gap: 24px;
  box-sizing: border-box;
  background: transparent;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    padding: 1.6rem;
    margin: 0;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <Container>
      <Header />
      {children}
      <Outlet />
    </Container>
  );
}