import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

const projectId = '7005e5dd47972e34e2a6f9e7deb5fd86';
export const CHAIN_ID = 13068200;

const cotiDevnet = defineChain({
  id: CHAIN_ID,
  caipNetworkId: 'eip155:123456789',
  chainNamespace: 'eip155',
  name: 'COTI Devnet',
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
  chains: [cotiDevnet],
  connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],
  transports: {
    [cotiDevnet.id]: http(),
  },
});
