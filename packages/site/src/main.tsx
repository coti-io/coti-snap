import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent, ReactNode } from 'react';
import { StrictMode, createContext, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled, { ThemeProvider } from 'styled-components';
import { WagmiProvider } from 'wagmi';

import App from './App.js';
import { Footer } from './components/Footer';
import { dark, GlobalStyle, light } from './config/theme.js';
import { config } from './config/wagmi.js';
import { MetaMaskProvider } from './hooks/MetamaskContext.js';
import { SnapProvider } from './hooks/SnapContext.js';
import { getThemePreference } from './utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
`;

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const [darkTheme] = useState(getThemePreference());

  return (
    <ThemeProvider theme={darkTheme ? dark : light}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <MetaMaskProvider>
            <SnapProvider>{children}</SnapProvider>
          </MetaMaskProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root>
      <Wrapper>
        <App />
        <Footer />
      </Wrapper>
      <GlobalStyle />
    </Root>
  </StrictMode>,
);
