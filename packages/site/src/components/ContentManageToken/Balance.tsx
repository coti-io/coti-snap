import React from 'react';
import { TokenBalanceAmount } from './styles/balance';
import type { BalanceProps } from './types/balance';

const DEFAULT_CURRENCY = 'COTI';

export const Balance: React.FC<BalanceProps> = ({ 
  balance, 
  currency = DEFAULT_CURRENCY,
  className,
  showCurrency = true
}) => {
  const formattedBalance = React.useMemo(() => {
    if (!balance || balance === '0' || typeof balance !== 'string') return '0';
    return balance;
  }, [balance]);

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