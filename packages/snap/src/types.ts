// tokens with balances and info
export type Tokens = { 
  name: string,
  symbol: string,
  address: string,
  type: TokenViewSelector,
  balance: string | null 
}[];

export enum TokenViewSelector {
  ERC20 = 'erc20',
  NFT = 'nft'
}

// global snap state
export type State = {
  balance: string,
  tokenBalances: Tokens,
  tokenView?: TokenViewSelector
}
