import { ONBOARD_CONTRACT_ADDRESS } from '@coti-io/coti-ethers';

const isLocal = import.meta.env.VITE_NODE_ENV === 'local';

export const USED_ONBOARD_CONTRACT_ADDRESS = ONBOARD_CONTRACT_ADDRESS;

export const ONBOARD_CONTRACT_LINK = isLocal
  ? 'https://testnet.cotiscan.io/address/0x24D6c44eaB7aA09A085dDB8cD25c28FFc9917EC9?tab=transactions'
  : 'https://mainnet.cotiscan.io/address/0x24D6c44eaB7aA09A085dDB8cD25c28FFc9917EC9?tab=transactions';

export const COTI_FAUCET_LINK = 'https://faucet.coti.io';
