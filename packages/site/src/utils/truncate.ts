/**
 * Truncate a string to the first and last five characters with ellipsis in between if it exceeds 10 characters.
 * @param str - The string to be truncated.
 * @returns The truncated string.
 */
export const truncateString = (str: string): string => {
  if (str.length <= 10) {
    return str;
  }
  const firstCharacters = str.slice(0, 6);
  const lastCharacters = str.slice(-4);
  return `${firstCharacters}...${lastCharacters}`;
};
