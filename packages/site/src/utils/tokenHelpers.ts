import { ImportedToken } from '../types/token';

export type SortType = 'az' | 'decline';

/**
 * Sorts an array of tokens based on the specified sort type.
 *
 * - 'az': Sorts tokens alphabetically by symbol.
 * - 'decline': Puts COTI at the top, then sorts remaining tokens by descending balance.
 *
 * @param tokens - The array of tokens to sort.
 * @param sortType - The sorting strategy ('az' or 'decline').
 * @param balances - Optional map of token symbols to their stringified balances.
 * @returns A new array of sorted tokens.
 */
export const sortTokens = (
  tokens: ImportedToken[],
  sortType: SortType,
  balances?: Record<string, string>
): ImportedToken[] => {
  const sortedTokens = [...tokens];

  if (sortType === 'az') {
    return sortedTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  if (sortType === 'decline') {
    const cotiToken = sortedTokens.find(token => token.symbol === 'COTI');
    const otherTokens = sortedTokens.filter(token => token.symbol !== 'COTI');

    const sortedOthers = otherTokens.sort((a, b) => {
      const balanceA = parseFloat(balances?.[a.symbol] ?? '0');
      const balanceB = parseFloat(balances?.[b.symbol] ?? '0');
      return balanceB - balanceA;
    });

    return cotiToken ? [cotiToken, ...sortedOthers] : sortedOthers;
  }

  return sortedTokens;
};
