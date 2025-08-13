import React, { useMemo } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../../types/token';
import { CotiLogo } from '../../../assets/icons';
import { Balance } from '../Balance';
import {
  TokenRow,
  TokenInfo,
  TokenLogos,
  TokenLogoBig,
  TokenName,
  TokenValues
} from '../styles';

interface TokenRowProps {
  token: ImportedToken;
  index: number;
  provider: BrowserProvider;
  cotiBalance?: string | undefined;
  propAESKey?: string | null | undefined;
  onSelectToken: (token: ImportedToken) => void;
  isDecrypted: boolean;
  onToggleDecryption: () => void;
  tokenBalance: string;
}

export const TokenRowComponent: React.FC<TokenRowProps> = React.memo(({
  token,
  index,
  cotiBalance,
  onSelectToken,
  isDecrypted,
  onToggleDecryption,
  tokenBalance
}) => {
  const tokenKey = useMemo(() =>
    token.address || `${token.symbol}-${index}`,
    [token.address, token.symbol, index]
  );

  const isCotiToken = useMemo(() =>
    !token.address && token.symbol === 'COTI',
    [token.address, token.symbol]
  );

  return (
    <TokenRow key={tokenKey} onClick={() => onSelectToken(token)}>
      <TokenInfo>
        <TokenLogos>
          <TokenLogoBig>
            {isCotiToken ? (
              <CotiLogo />
            ) : (
              token.symbol[0]
            )}
          </TokenLogoBig>
        </TokenLogos>
        <TokenName>{token.name}</TokenName>
      </TokenInfo>
      <TokenValues>
        <Balance
          balance={token.symbol === 'COTI' ? (cotiBalance || '0') : tokenBalance}
          currency={token.symbol}
          decimals={token.symbol === 'COTI' ? 18 : (token.decimals ?? 18)}
          isDecrypted={isDecrypted}
          onToggleDecryption={onToggleDecryption}
        />
      </TokenValues>
    </TokenRow>
  );
});

TokenRowComponent.displayName = 'TokenRowComponent';