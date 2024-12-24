import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { WagmiProvider } from 'wagmi';

import { config } from './config';
import { dark, light } from './config/theme';
import { MetaMaskProvider } from './hooks';
import { getThemePreference, setLocalStorage } from './utils';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

const queryClient = new QueryClient();

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(getThemePreference());

  const toggleTheme: ToggleTheme = () => {
    setLocalStorage('theme', darkTheme ? 'light' : 'dark');
    setDarkTheme(!darkTheme);
  };

  return (
    <ToggleThemeContext.Provider value={toggleTheme}>
      <ThemeProvider theme={darkTheme ? dark : light}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <MetaMaskProvider>{children}</MetaMaskProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ToggleThemeContext.Provider>
  );
};
