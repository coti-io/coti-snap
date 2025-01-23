import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FunctionComponent, ReactNode } from 'react';
import React from 'react';
import { WagmiProvider } from 'wagmi';

import { config } from '../config';
import { MetaMaskProvider } from '../hooks';
import { SnapProvider } from '../hooks/SnapContext';

export type RootProps = {
  children: ReactNode;
};
const queryClient = new QueryClient();

export const Web3Providers: FunctionComponent<RootProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MetaMaskProvider>
          <SnapProvider>{children}</SnapProvider>
        </MetaMaskProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
