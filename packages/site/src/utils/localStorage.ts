import { ImportedToken, TokenType } from '../types/token';
import { IMPORTED_TOKENS_KEY, ERROR_MESSAGES } from '../constants/token';

/**
 * Get a local storage key.
 *
 * @param key - The local storage key to access.
 * @returns The value stored at the key provided if the key exists.
 */
export const getLocalStorage = (key: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    const data = ls.getItem(key);
    return data;
  }

  throw new Error(ERROR_MESSAGES.LOCALSTORAGE_UNAVAILABLE);
};

/**
 * Set a value to local storage at a certain key.
 *
 * @param key - The local storage key to set.
 * @param value - The value to set.
 */
export const setLocalStorage = (key: string, value: string) => {
  const { localStorage: ls } = window;

  if (ls !== null) {
    ls.setItem(key, value);
    return;
  }

  throw new Error(ERROR_MESSAGES.LOCALSTORAGE_UNAVAILABLE);
};

/**
 * Get imported tokens from local storage.
 *
 * @returns Array of imported tokens or empty array if none exist.
 */
export const getImportedTokens = (): ImportedToken[] => {
  try {
    const data = getLocalStorage(IMPORTED_TOKENS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading imported tokens from localStorage:', error);
    return [];
  }
};

/**
 * Save imported tokens to local storage.
 *
 * @param tokens - Array of imported tokens to save.
 */
export const setImportedTokens = (tokens: ImportedToken[]) => {
  try {
    setLocalStorage(IMPORTED_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving imported tokens to localStorage:', error);
  }
};

/**
 * Add a new imported token to local storage.
 *
 * @param token - The token to add.
 */
export const addImportedToken = (token: ImportedToken) => {
  const existingTokens = getImportedTokens();
  const normalizedAddress = token.address.toLowerCase();
  
  // Check if token already exists (case-insensitive)
  const tokenExists = existingTokens.some(
    existingToken => existingToken.address.toLowerCase() === normalizedAddress
  );
  
  if (!tokenExists) {
    const updatedTokens = [...existingTokens, { ...token, address: normalizedAddress }];
    setImportedTokens(updatedTokens);
  }
};

/**
 * Remove an imported token from local storage.
 *
 * @param address - The token address to remove.
 */
export const removeImportedToken = (address: string) => {
  const existingTokens = getImportedTokens();
  const normalizedAddress = address.toLowerCase();
  const updatedTokens = existingTokens.filter(
    token => token.address.toLowerCase() !== normalizedAddress
  );
  setImportedTokens(updatedTokens);
};

/**
 * Get imported tokens filtered by type.
 *
 * @param tokenType - The type of tokens to filter by.
 * @returns Array of imported tokens of the specified type.
 */
export const getImportedTokensByType = (tokenType: TokenType): ImportedToken[] => {
  const allTokens = getImportedTokens();
  return allTokens.filter(token => token.type === tokenType);
};

/**
 * Get all ERC20 tokens from local storage.
 *
 * @returns Array of ERC20 tokens.
 */
export const getERC20Tokens = (): ImportedToken[] => {
  return getImportedTokensByType('ERC20');
};

/**
 * Get all NFT tokens (ERC721 and ERC1155) from local storage.
 *
 * @returns Array of NFT tokens (both ERC721 and ERC1155).
 */
export const getNFTTokens = (): ImportedToken[] => {
  const allTokens = getImportedTokens();
  return allTokens.filter(token => token.type === 'ERC721' || token.type === 'ERC1155');
};