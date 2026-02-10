export type BaseBalanceProps = {
  balance: string;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
  decimals?: number;
  isDecrypted?: boolean;
};

export type BalanceProps = {
  onToggleDecryption?: () => void;
} & BaseBalanceProps;

export type BalanceDisplayProps = {
  balance: string;
  currency?: string | undefined;
  className?: string | undefined;
  showCurrency?: boolean;
  decimals?: number;
  isDecrypted?: boolean;
};

export type BalanceVariant = 'primary' | 'secondary' | 'token';

export type StyledBalanceProps = {
  variant?: BalanceVariant;
  encrypted?: boolean;
};
