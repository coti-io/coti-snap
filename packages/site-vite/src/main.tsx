import { createRoot } from 'react-dom/client';
import { StrictMode, createContext, useState, FunctionComponent, ReactNode } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { WagmiProvider } from 'wagmi';
import { MetaMaskProvider } from './hooks/MetamaskContext.tsx';
import { SnapProvider } from './hooks/SnapContext.tsx';
import { dark, GlobalStyle, light } from './config/theme';
import { getThemePreference } from './utils';
import App from './App';
import { config } from './config/wagmi.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
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
              <SnapProvider>
              <Wrapper>{children}</Wrapper>
          </SnapProvider>
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
      
              <App />
              <GlobalStyle />
    </Root>
  </StrictMode>,
);