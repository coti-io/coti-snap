import { defineChain } from 'viem';
import { http, createConfig } from 'wagmi';

export const CHAIN_ID = 7082400;

export const COTI = defineChain({
  id: CHAIN_ID,
  name: 'COTI',
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
      webSocket: ['WS_RPC_URLwss://testnet.coti.io/ws'],
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
