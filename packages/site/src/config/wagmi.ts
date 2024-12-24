import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';

export const CHAIN_ID = 13068200;

export const COTI = defineChain({
  id: CHAIN_ID,
  name: 'COTI',
  caipNetworkId: 'eip155:123456789',
  chainNamespace: 'eip155',
  nativeCurrency: {
    decimals: 18,
    name: 'COTI 2',
    symbol: 'COTI2',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.coti.io/rpc'],
      webSocket: ['WS_RPC_URLwss://devnet.coti.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://devnet.cotiscan.io' },
  },
  contracts: {
    // Add the contracts here
  },
});

export const config = createConfig({
  chains: [COTI],
  transports: {
    // [mainnet.id]: http(),
    // [sepolia.id]: http(),
    [COTI.id]: http(),
  },
});
