import {
  COTI_TESTNET_CHAIN_ID,
  COTI_MAINNET_CHAIN_ID,
} from '../config/wagmi';
import type { ImportedToken } from '../types/token';

export type PreloadedToken = ImportedToken & { isPrivate?: boolean };

export const PRELOADED_TOKENS: Record<number, PreloadedToken[]> = {
  [COTI_TESTNET_CHAIN_ID]: [
    { address: '0x8bca4e6bbE402DB4aD189A316137aD08206154FB', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18, type: 'ERC20' },
    { address: '0x5dBDb2E5D51c3FFab5D6B862Caa11FCe1D83F492', name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8, type: 'ERC20' },
    { address: '0x9e961430053cd5AbB3b060544cEcCec848693Cf0', name: 'Tether USD', symbol: 'USDT', decimals: 6, type: 'ERC20' },
    { address: '0x63f3D2Cc8F5608F57ce6E5Aa3590A2Beb428D19C', name: 'USD Coin Bridged', symbol: 'USDC.e', decimals: 6, type: 'ERC20' },
    { address: '0xe3E2cd3Abf412c73a404b9b8227B71dE3CfE829D', name: 'Wrapped ADA', symbol: 'wADA', decimals: 18, type: 'ERC20' },
    { address: '0x878a42D3cB737DEC9E6c7e7774d973F46fd8ed4C', name: 'Governance COTI', symbol: 'gCOTI', decimals: 18, type: 'ERC20' },
    { address: '0xF009BADb181d471995a1CFF406C3Db7B180F64eA', name: 'Private Wrapped Ether', symbol: 'p.WETH', decimals: 18, type: 'ERC20', isPrivate: true },
    { address: '0xB50F1680a4C69145ABc09A2A71c8D5b8051578cF', name: 'Private Wrapped Bitcoin', symbol: 'p.WBTC', decimals: 8, type: 'ERC20', isPrivate: true },
    { address: '0xcEF137E96eDF68EE99D4CdEa7085f154d74895cD', name: 'Private Tether USD', symbol: 'p.USDT', decimals: 6, type: 'ERC20', isPrivate: true },
    { address: '0x37f78dcCd15876F74391EF1F01b76557D9FF1dea', name: 'Private USD Coin Bridged', symbol: 'p.USDC.e', decimals: 6, type: 'ERC20', isPrivate: true },
    { address: '0x1245f50a3E9129A219b4bf66D10fEaEA47467B69', name: 'Private Wrapped ADA', symbol: 'p.wADA', decimals: 18, type: 'ERC20', isPrivate: true },
    { address: '0x1503b02a4Aa27812306c65116FD23b733603F142', name: 'Private Governance COTI', symbol: 'p.gCOTI', decimals: 18, type: 'ERC20', isPrivate: true },
  ],
  [COTI_MAINNET_CHAIN_ID]: [
    { address: '0x639aCc80569c5FC83c6FBf2319A6Cc38bBfe26d1', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18, type: 'ERC20' },
    { address: '0x8C39B1fD0e6260fdf20652Fc436d25026832bfEA', name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8, type: 'ERC20' },
    { address: '0xfA6f73446b17A97a56e464256DA54AD43c2Cbc3E', name: 'Tether USD', symbol: 'USDT', decimals: 6, type: 'ERC20' },
    { address: '0xf1Feebc4376c68B7003450ae66343Ae59AB37D3C', name: 'USD Coin Bridged', symbol: 'USDC.e', decimals: 6, type: 'ERC20' },
    { address: '0xe757Ca19d2c237AA52eBb1d2E8E4368eeA3eb331', name: 'Wrapped ADA', symbol: 'wADA', decimals: 18, type: 'ERC20' },
    { address: '0x7637C7838EC4Ec6b85080F28A678F8E234bB83D1', name: 'Governance COTI', symbol: 'gCOTI', decimals: 18, type: 'ERC20' },
  ],
};
