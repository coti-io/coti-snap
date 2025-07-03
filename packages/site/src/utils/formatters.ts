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
 * Formats a balance with max length limit for display
 */
const MAX_BALANCE_LENGTH = 12;

export const formatBalance = (balance: string): string => {
  if (!balance) return '0';
  return balance.length > MAX_BALANCE_LENGTH 
    ? `${balance.slice(0, MAX_BALANCE_LENGTH)}...`
    : balance;
};