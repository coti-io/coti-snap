export interface BaseBalanceProps {
  balance: string;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
}

export interface BalanceProps extends BaseBalanceProps {
  isDecrypted?: boolean;
  onToggleDecryption?: () => void;
}

export interface BalanceDisplayProps {
  balance: string;
  currency?: string | undefined;
  className?: string | undefined;
  showCurrency?: boolean;
}

export type BalanceVariant = 'primary' | 'secondary' | 'token';

export interface StyledBalanceProps {
  variant?: BalanceVariant;
  encrypted?: boolean;
}