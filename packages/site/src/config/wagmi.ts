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

// Default to regular MetaMask connector
export const CONNECTOR_MM: CONNECTOR = CONNECTOR_MM_REGULAR;

// Export both connectors for dynamic selection
export const CONNECTOR_MM_FLASK_EXPORT = CONNECTOR_MM_FLASK;
export const CONNECTOR_MM_REGULAR_EXPORT = CONNECTOR_MM_REGULAR;

const isTestnet = import.meta.env.VITE_NODE_ENV === 'testnet';

export const COTI_TESTNET_CHAIN_ID = 7082400;
export const COTI_MAINNET_CHAIN_ID = 2632500;

export const CHAIN_ID = isTestnet ? COTI_TESTNET_CHAIN_ID : COTI_MAINNET_CHAIN_ID;

const COTI_TESTNET = defineChain({
  id: COTI_TESTNET_CHAIN_ID,
  name: 'COTI Testnet',
  caipNetworkId: 'eip155:7082400',
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

const COTI_MAINNET = defineChain({
  id: COTI_MAINNET_CHAIN_ID,
  name: 'COTI Mainnet',
  caipNetworkId: 'eip155:2632500',
  chainNamespace: 'eip155',
  nativeCurrency: {
    decimals: 18,
    name: 'COTI',
    symbol: 'COTI',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.coti.io/rpc'],
      webSocket: ['wss://mainnet.coti.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://mainnet.cotiscan.io' },
  },
  contracts: {},
});

export const COTI = isTestnet ? COTI_TESTNET : COTI_MAINNET;

export const config = createConfig({
  chains: [COTI],
  transports: {
    [COTI_TESTNET_CHAIN_ID]: http(),
    [COTI_MAINNET_CHAIN_ID]: http(),
  },
});
