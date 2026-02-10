export type TokenType = 'ERC20' | 'ERC721' | 'ERC1155';

export type ImportedToken = {
  address: string;
  name: string;
  symbol: string;
  decimals?: number; // Optional for NFTs (ERC721/ERC1155)
  type: TokenType;
};

export type NFTFormData = {
  address: string;
  tokenId: string;
  tokenType: 'ERC721' | 'ERC1155';
};

export type NFTFormErrors = {
  address: string;
  tokenId: string;
  tokenType?: string;
};

export type TokenFormData = {
  address: string;
  symbol: string;
  decimals: string;
};

export type TokenFormErrors = {
  address: string;
  symbol: string;
  decimals: string;
};
