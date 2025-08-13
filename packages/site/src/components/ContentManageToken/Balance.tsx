import React from 'react';
import { TokenBalanceAmount } from './styles/balance';
import type { BalanceProps } from './types/balance';
import { formatTokenBalance, formatBalance } from '../../utils/formatters';

const DEFAULT_CURRENCY = 'COTI';

export const Balance: React.FC<BalanceProps> = ({ 
  balance, 
  currency = DEFAULT_CURRENCY,
  className,
  showCurrency = true,
  decimals,
  isDecrypted = true
}) => {
  const formattedBalance = React.useMemo(() => {
    if (!balance || balance === '0' || typeof balance !== 'string') return '0';
    
    if (!isDecrypted) return '(encrypted)';
    
    if (balance !== '0' && decimals !== undefined) {
      const tokenDecimals = currency === 'COTI' ? 18 : decimals;
      return formatTokenBalance(balance, tokenDecimals);
    }
    
    return formatBalance(balance);
  }, [balance, decimals, currency, isDecrypted]);

  const displayText = React.useMemo(() => {
    if (!showCurrency) return formattedBalance;
    return `${formattedBalance} ${currency}`;
  }, [formattedBalance, currency, showCurrency]);

  return (
    <TokenBalanceAmount className={className}>
      {displayText}
    </TokenBalanceAmount>
  );
};