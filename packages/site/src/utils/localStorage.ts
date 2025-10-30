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
 * Get the storage key for imported tokens for a specific account.
 *
 * @param address - The account address.
 * @returns The storage key for the account's imported tokens.
 */
export const getAccountTokensKey = (address: string): string => {
  return `${IMPORTED_TOKENS_KEY}_${address.toLowerCase()}`;
};

/**
 * Get imported tokens from local storage for a specific account.
 *
 * @param address - The account address to get tokens for.
 * @returns Array of imported tokens or empty array if none exist.
 */
export const getImportedTokensByAccount = (address: string): ImportedToken[] => {
  if (!address) return [];

  try {
    const accountKey = getAccountTokensKey(address);
    const data = getLocalStorage(accountKey);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    void error;
    return [];
  }
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
    void error;
    return [];
  }
};

/**
 * Save imported tokens to local storage for a specific account.
 *
 * @param address - The account address.
 * @param tokens - Array of imported tokens to save.
 */
export const setImportedTokensByAccount = (address: string, tokens: ImportedToken[]) => {
  if (!address) return;

  try {
    const accountKey = getAccountTokensKey(address);
    setLocalStorage(accountKey, JSON.stringify(tokens));
  } catch (error) {
    void error;
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
    void error;
  }
};

/**
 * Add a new imported token to local storage for a specific account.
 *
 * @param accountAddress - The account address.
 * @param token - The token to add.
 */
export const addImportedTokenByAccount = (accountAddress: string, token: ImportedToken) => {
  if (!accountAddress) return;

  const existingTokens = getImportedTokensByAccount(accountAddress);
  const normalizedAddress = token.address.toLowerCase();

  const tokenExists = existingTokens.some(
    existingToken => existingToken.address.toLowerCase() === normalizedAddress
  );

  if (!tokenExists) {
    const updatedTokens = [...existingTokens, { ...token, address: normalizedAddress }];
    setImportedTokensByAccount(accountAddress, updatedTokens);
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
 * Remove an imported token from local storage for a specific account.
 *
 * @param accountAddress - The account address.
 * @param tokenAddress - The token address to remove.
 */
export const removeImportedTokenByAccount = (accountAddress: string, tokenAddress: string) => {
  if (!accountAddress) return;

  const existingTokens = getImportedTokensByAccount(accountAddress);
  const normalizedAddress = tokenAddress.toLowerCase();
  const updatedTokens = existingTokens.filter(
    token => token.address.toLowerCase() !== normalizedAddress
  );
  setImportedTokensByAccount(accountAddress, updatedTokens);
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
 * Clear all imported tokens for a specific account.
 *
 * @param accountAddress - The account address.
 */
export const clearImportedTokensByAccount = (accountAddress: string) => {
  if (!accountAddress) return;
  setImportedTokensByAccount(accountAddress, []);
};

/**
 * Get imported tokens filtered by type for a specific account.
 *
 * @param accountAddress - The account address.
 * @param tokenType - The type of tokens to filter by.
 * @returns Array of imported tokens of the specified type.
 */
export const getImportedTokensByTypeAndAccount = (accountAddress: string, tokenType: TokenType): ImportedToken[] => {
  const allTokens = getImportedTokensByAccount(accountAddress);
  return allTokens.filter(token => token.type === tokenType);
};

/**
 * Get all ERC20 tokens from local storage for a specific account.
 *
 * @param accountAddress - The account address.
 * @returns Array of ERC20 tokens.
 */
export const getERC20TokensByAccount = (accountAddress: string): ImportedToken[] => {
  return getImportedTokensByTypeAndAccount(accountAddress, 'ERC20');
};

/**
 * Get all NFT tokens (ERC721 and ERC1155) from local storage for a specific account.
 *
 * @param accountAddress - The account address.
 * @returns Array of NFT tokens (both ERC721 and ERC1155).
 */
export const getNFTTokensByAccount = (accountAddress: string): ImportedToken[] => {
  const allTokens = getImportedTokensByAccount(accountAddress);
  return allTokens.filter(token => token.type === 'ERC721' || token.type === 'ERC1155');
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
