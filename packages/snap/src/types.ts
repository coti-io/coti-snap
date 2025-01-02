/* eslint-disable @typescript-eslint/naming-convention */
// tokens with balances and info
export type Token = {
  name: string;
  symbol: string;
  address: string;
  type: TokenViewSelector;
  confidential: boolean;
  balance: string | null;
  tokenImage?: string;
  tokenPrice?: string;
};

export type Tokens = {
  name: string;
  symbol: string;
  address: string;
  type: TokenViewSelector;
  confidential: boolean;
  balance: string | null;
  tokenImage?: string;
  tokenPrice?: string;
}[];

export enum TokenViewSelector {
  ERC20 = 'erc20',
  NFT = 'nft',
  UNKNOWN = 'unknown',
}

// global snap state
export type State = {
  balance: string;
  tokenBalances: Tokens;
  tokenView?: TokenViewSelector;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AESKey?: string;
};
