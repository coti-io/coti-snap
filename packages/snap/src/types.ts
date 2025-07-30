// tokens with balances and info
export type Token = {
  name: string;
  symbol: string;
  address: string;
  type: TokenViewSelector;
  confidential: boolean;
  balance: string | null;
  tokenImage?: string;
  decimals: string | null;
  tokenPrice?: string | null;
  tokenId?: string | null;
  uri?: string | null;
  image?: string | null;
};

export type Tokens = Token[];

export enum TokenViewSelector {
  ERC20 = 'erc20',
  NFT = 'nft',
  UNKNOWN = 'unknown',
}

export type StateIdentifier = {
  chainId: string;
  address: string;
};

export type GeneralState = {
  [chainId: string]: {
    [address: string]: State;
  };
};

// global snap state
export type State = {
  balance: string;
  tokenBalances: Tokens;
  aesKey: string | null;
  tokenView?: TokenViewSelector;
};
