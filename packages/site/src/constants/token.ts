export const IMPORTED_TOKENS_KEY = 'imported_tokens';
export const TOKEN_ID_REGEX = /^\d*$/;
export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const ERROR_MESSAGES = {
  INVALID_ADDRESS: 'Invalid address',
  TOKEN_ID_REQUIRED: 'Token ID required',
  TOKEN_ID_INVALID: 'Token ID must be a number',
  SYMBOL_REQUIRED: 'Symbol required',
  DECIMALS_REQUIRED: 'Decimals required',
  DECIMALS_INVALID: 'Decimals must be a number',
  NFT_ALREADY_IMPORTED: 'NFT already imported',
  IMPORT_FAILED: 'Failed to import NFT',
  LOCALSTORAGE_UNAVAILABLE: 'Local storage is not available.'
} as const;