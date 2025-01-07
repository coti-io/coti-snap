import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { WagmiProvider } from 'wagmi';
import { ethers } from 'ethers';

import { config } from './config';
import { dark, light } from './config/theme';
import { MetaMaskProvider } from './hooks';
import { SnapProvider } from './hooks/SnapContext';
import { getThemePreference, setLocalStorage } from './utils';
import { EthersProvider } from './hooks/EthersContext';

export type RootProps = {
  children: ReactNode;
};

type ToggleTheme = () => void;

export const ToggleThemeContext = createContext<ToggleTheme>(
  (): void => undefined,
);

const queryClient = new QueryClient();

export const Root: FunctionComponent<RootProps> = ({ children }) => {
  const ethers = require('ethers')
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
            <MetaMaskProvider>
            <EthersProvider>
              <SnapProvider>{children}</SnapProvider>
            </EthersProvider>
            </MetaMaskProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </ToggleThemeContext.Provider>
  );
};
