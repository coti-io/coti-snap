export const COTI_TESTNET_CHAIN_ID = '7082400';
export const COTI_MAINNET_CHAIN_ID = '2632500';

export type NetworkConfig = {
  chainId: string;
  networkName: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
};

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  [COTI_TESTNET_CHAIN_ID]: {
    chainId: COTI_TESTNET_CHAIN_ID,
    networkName: 'COTI Testnet',
    rpcUrl: 'https://testnet.coti.io/rpc',
    explorerUrl: 'https://testnet.cotiscan.io',
    isTestnet: true,
  },
  [COTI_MAINNET_CHAIN_ID]: {
    chainId: COTI_MAINNET_CHAIN_ID,
    networkName: 'COTI Mainnet',
    rpcUrl: 'https://mainnet.coti.io/rpc',
    explorerUrl: 'https://mainnet.cotiscan.io',
    isTestnet: false,
  },
};

let currentEnvironment: 'testnet' | 'mainnet' | null = null;

export const detectEnvironment = (): 'testnet' | 'mainnet' => {
  // Always return the current environment if it's set
  if (currentEnvironment) {
    return currentEnvironment;
  }

  // Check for local development environment
  if (
    typeof globalThis !== 'undefined' &&
    (globalThis as any).__SNAP_ENV__ === 'local'
  ) {
    currentEnvironment = 'testnet';
    return 'testnet';
  }

  // Check for development mode
  const isDevelopment =
    (typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'development') ||
    (typeof globalThis !== 'undefined' && (globalThis as any).__DEV__ === true);

  // Default to mainnet for production, testnet for development
  const environment = isDevelopment ? 'testnet' : 'mainnet';
  currentEnvironment = environment;
  return environment;
};

export const setEnvironment = (environment: 'testnet' | 'mainnet'): void => {
  currentEnvironment = environment;
};

export const resetEnvironment = (): void => {
  currentEnvironment = null;
};

export const getCurrentNetworkConfig = (): NetworkConfig => {
  const environment = detectEnvironment();
  const chainId =
    environment === 'testnet' ? COTI_TESTNET_CHAIN_ID : COTI_MAINNET_CHAIN_ID;
  const config = NETWORK_CONFIGS[chainId];
  if (!config) {
    throw new Error(
      `Network configuration not found for environment: ${environment}`,
    );
  }
  return config;
};

export const CHAIN_ID = getCurrentNetworkConfig().chainId;
export const COMPANION_DAPP_LINK = 'https://metamask.coti.io/wallet';
