/**
 * Utility functions for formatting various types of data
 */

/**
 * Truncates a balance string to specified length with ellipsis
 */
export const truncateBalance = (balance: string, maxLength = 10): string => {
  if (!balance || balance.length <= maxLength) {
    return balance;
  }
  return balance.slice(0, maxLength) + '...';
};

/**
 * Formats a number to a currency-like string
 */
export const formatCurrency = (amount: number | string, currency = 'USD', decimals = 2): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);
};

/**
 * Formats a large number with appropriate suffixes (K, M, B)
 */
export const formatNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numValue)) {
    return '0';
  }

  if (numValue >= 1e9) {
    return (numValue / 1e9).toFixed(1) + 'B';
  }
  if (numValue >= 1e6) {
    return (numValue / 1e6).toFixed(1) + 'M';
  }
  if (numValue >= 1e3) {
    return (numValue / 1e3).toFixed(1) + 'K';
  }

  return numValue.toFixed(2);
};

/**
 * Formats a token symbol for display
 */
export const formatTokenSymbol = (symbol: string): string => {
  if (!symbol) return '';
  return symbol.toUpperCase();
};

/**
 * Formats a token name for display
 */
export const formatTokenName = (name: string): string => {
  if (!name) return 'Unknown Token';
  return name.trim();
};

/**
 * Formats a token balance from wei to human readable format
 */
export const formatTokenBalance = (balance: string, decimals: number): string => {
  if (!balance || balance === '0') return '0';

  if (balance.includes('.')) {
    return formatBalance(balance);
  }

  if (/^\d+$/.test(balance)) {
    try {
      const balanceNumber = BigInt(balance);
      const divisor = BigInt(10 ** decimals);
      const wholePart = balanceNumber / divisor;
      const fractionalPart = balanceNumber % divisor;

      if (fractionalPart === 0n) {
        return wholePart.toString();
      }

      const wholeStr = wholePart.toString();
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');

      let trimmedFractional = fractionalStr.replace(/0+$/, '');

      if (wholePart === 0n && trimmedFractional.length > 2) {
        trimmedFractional = trimmedFractional.slice(0, 6);
      } else if (trimmedFractional.length > 4) {
        trimmedFractional = trimmedFractional.slice(0, 4);
      }

      if (trimmedFractional.length < 2 && fractionalPart > 0n) {
        trimmedFractional = fractionalStr.slice(0, 2);
      }

      const formatted = trimmedFractional.length > 0 ? `${wholeStr}.${trimmedFractional}` : wholeStr;
      return formatBalance(formatted);
    } catch (error) {
      console.error('Error formatting token balance:', error);
      return formatBalance(balance);
    }
  }

  return formatBalance(balance);
};

/**
 * Formats a balance with max length limit for display
 */
const MAX_BALANCE_LENGTH = 12;

export const formatBalance = (balance: string): string => {
  if (!balance || balance === '0') return '0';

  if (balance.includes('.')) {
    const [whole = '', decimal = ''] = balance.split('.');
    const limitedDecimal = decimal.length > 6 ? decimal.slice(0, 6) : decimal;
    const formatted = limitedDecimal ? `${whole}.${limitedDecimal}` : whole;

    return formatted.length > MAX_BALANCE_LENGTH
      ? `${formatted.slice(0, MAX_BALANCE_LENGTH)}...`
      : formatted;
  }

  return balance.length > MAX_BALANCE_LENGTH
    ? `${balance.slice(0, MAX_BALANCE_LENGTH)}...`
    : balance;
};