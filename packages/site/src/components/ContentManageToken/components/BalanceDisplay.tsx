import React from 'react';
import { PrimaryBalanceAmount } from '../styles/balance';
import type { BalanceDisplayProps } from '../types/balance';

const DEFAULT_CURRENCY = 'COTI';

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
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
    <PrimaryBalanceAmount className={className}>
      {displayText}
    </PrimaryBalanceAmount>
  );
};