import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';

export type CONNECTOR = {
  ID: string;
  INSTALLATION_URL: string;
};

const CONNECTOR_MM_FLASK: CONNECTOR = {
  ID: 'io.metamask.flask',
  INSTALLATION_URL: 'https://metamask.io/flask/',
};

const CONNECTOR_MM_REGULAR: CONNECTOR = {
  ID: 'io.metamask',
  INSTALLATION_URL: 'https://metamask.io/',
};

export const CONNECTOR_MM: CONNECTOR = CONNECTOR_MM_FLASK;

export const CHAIN_ID = 7082400;

export const COTI = defineChain({
  id: CHAIN_ID,
  name: 'COTI Testnet',
  caipNetworkId: 'eip155:123456789',
  chainNamespace: 'eip155',
  nativeCurrency: {
    decimals: 18,
    name: 'COTI',
    symbol: 'COTI',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.coti.io/rpc'],
      webSocket: ['wss://testnet.coti.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://testnet.cotiscan.io' },
  },
  contracts: {},
});

export const config = createConfig({
  chains: [COTI],
  transports: {
    [COTI.id]: http(),
  },
});
