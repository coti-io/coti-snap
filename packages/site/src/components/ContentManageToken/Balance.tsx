import React from 'react';
import { BalanceAmount } from './styles';
import { ToggleIcon } from './components/ToggleIcon';

interface BalanceProps {
  balance: string;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
  isDecrypted?: boolean;
  onToggleDecryption?: () => void;
}

const DEFAULT_CURRENCY = 'COTI';

export const Balance: React.FC<BalanceProps> = ({ 
  balance, 
  currency = DEFAULT_CURRENCY,
  className,
  showCurrency = true,
  isDecrypted = false,
  onToggleDecryption
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
    <BalanceAmount className={className}>
      {displayText}
      {onToggleDecryption && (
        <ToggleIcon
          onClick={onToggleDecryption}
          title={isDecrypted ? "Hide token balances" : "Show token balances"}
        >
        </ToggleIcon>
      )}
    </BalanceAmount>
  );
};