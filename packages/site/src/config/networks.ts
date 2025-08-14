import { COTI_TESTNET_CHAIN_ID, COTI_MAINNET_CHAIN_ID } from './wagmi';

export interface NetworkConfig {
  id: number;
  name: string;
  displayName: string;
  shortName: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  faucetUrl?: string;
  color: string;
  badgeColor: string;
}

export const NETWORKS: Record<number, NetworkConfig> = {
  [COTI_TESTNET_CHAIN_ID]: {
    id: COTI_TESTNET_CHAIN_ID,
    name: 'COTI Testnet',
    displayName: 'COTI TESTNET',
    shortName: 'TESTNET',
    rpcUrl: 'https://testnet.coti.io/rpc',
    wsUrl: 'wss://testnet.coti.io/ws',
    explorerUrl: 'https://testnet.cotiscan.io',
    nativeCurrency: {
      name: 'COTI',
      symbol: 'COTI',
      decimals: 18,
    },
    isTestnet: true,
    faucetUrl: 'https://faucet.coti.io',
    color: '#ff6b35',
    badgeColor: 'rgba(255, 107, 53, 0.1)',
  },
  [COTI_MAINNET_CHAIN_ID]: {
    id: COTI_MAINNET_CHAIN_ID,
    name: 'COTI',
    displayName: 'COTI MAINNET',
    shortName: 'MAINNET',
    rpcUrl: 'https://mainnet.coti.io/rpc',
    wsUrl: 'wss://mainnet.coti.io/ws',
    explorerUrl: 'https://mainnet.cotiscan.io',
    nativeCurrency: {
      name: 'COTI',
      symbol: 'COTI',
      decimals: 18,
    },
    isTestnet: false,
    color: '#00d4aa',
    badgeColor: 'rgba(0, 212, 170, 0.1)',
  },
};

export const getCurrentNetworkConfig = (): NetworkConfig => {
  const isLocal = import.meta.env.VITE_NODE_ENV === 'local';
  const chainId = isLocal ? COTI_TESTNET_CHAIN_ID : COTI_MAINNET_CHAIN_ID;
  const config = NETWORKS[chainId];
  if (!config) {
    throw new Error(`Network configuration not found for chain ID: ${chainId}`);
  }
  return config;
};

export const getNetworkStatus = (): {
  network: NetworkConfig;
  isTestnet: boolean;
  environmentType: 'development' | 'production';
} => {
  const network = getCurrentNetworkConfig();
  return {
    network,
    isTestnet: network.isTestnet,
    environmentType: network.isTestnet ? 'development' : 'production',
  };
};