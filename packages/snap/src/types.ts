// tokens with balances and info
export type Token = {
  name: string;
  symbol: string;
  address: string;
  type: TokenViewSelector;
  confidential: boolean;
  balance: string | null;
  tokenImage?: string;
  tokenPrice?: string | null;
  tokenId?: string | null;
  uri?: string | null;
};

export type Tokens = Token[];

export enum TokenViewSelector {
  ERC20 = 'erc20',
  NFT = 'nft',
  UNKNOWN = 'unknown',
}

// global snap state
export type State = {
  balance: string;
  tokenBalances: Tokens;
  AESKey: string | null;
  tokenView?: TokenViewSelector;
};
