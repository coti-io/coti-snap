import {
  COTI_TESTNET_CHAIN_ID,
  COTI_MAINNET_CHAIN_ID,
  DEFAULT_CHAIN_ID,
  SUPPORTED_CHAIN_IDS,
} from './wagmi';

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
    name: 'COTI Mainnet',
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

export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number];

const SUPPORTED_CHAIN_ID_SET = new Set<number>(SUPPORTED_CHAIN_IDS);

export const isSupportedChainId = (
  chainId: number | null | undefined,
): chainId is SupportedChainId => {
  if (typeof chainId !== 'number') {
    return false;
  }
  return SUPPORTED_CHAIN_ID_SET.has(chainId);
};

export const normalizeChainId = (
  chainId: number | null | undefined,
): SupportedChainId => {
  return isSupportedChainId(chainId) ? chainId : DEFAULT_CHAIN_ID;
};

export const getNetworkConfig = (
  chainId?: number | null,
): NetworkConfig => {
  const normalizedChainId = normalizeChainId(chainId ?? undefined);
  return NETWORKS[normalizedChainId];
};

export const getNetworkStatus = (
  chainId?: number | null,
): {
  network: NetworkConfig;
  isTestnet: boolean;
  environmentType: 'development' | 'production';
} => {
  const network = getNetworkConfig(chainId);
  return {
    network,
    isTestnet: network.isTestnet,
    environmentType: network.isTestnet ? 'development' : 'production',
  };
};

export const getEnvironmentForChain = (
  chainId?: number | null,
): 'testnet' | 'mainnet' => {
  return getNetworkConfig(chainId).isTestnet ? 'testnet' : 'mainnet';
};

export const getSupportedNetworks = (): NetworkConfig[] => {
  return SUPPORTED_CHAIN_IDS.map((chainId) => NETWORKS[chainId]);
};
