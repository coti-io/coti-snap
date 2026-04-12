import type { BrowserProvider } from '@coti-io/coti-ethers';
import { Lock } from 'lucide-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import {
  CotiLogo,
  COTITokenIcon,
  WETHIcon,
  WBTCIcon,
  USDTIcon,
  USDCIcon,
  WADAIcon,
  GCOTIIcon,
} from '../../../assets/icons';
import type { ImportedToken } from '../../../types/token';
import { Balance } from '../Balance';
import {
  TokenRow,
  TokenInfo,
  TokenLogos,
  TokenLogoBig,
  TokenName,
  TokenValues,
} from '../styles';

const TOKEN_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  WETH: WETHIcon,
  WBTC: WBTCIcon,
  USDT: USDTIcon,
  'USDC.E': USDCIcon,
  WADA: WADAIcon,
  GCOTI: GCOTIIcon,
  COTI: COTITokenIcon,
};

const TokenLogoWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const LockBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -4px;
  background: #f97316;
  border-radius: 50%;
  width: 13px;
  height: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #1a1b23;
  z-index: 10;
`;

type TokenRowProps = {
  token: ImportedToken;
  index: number;
  provider: BrowserProvider;
  cotiBalance?: string | undefined;
  propAESKey?: string | null | undefined;
  onSelectToken: (token: ImportedToken) => void;
  isDecrypted: boolean;
  onToggleDecryption: () => void;
  tokenBalance: string;
};

export const TokenRowComponent: React.FC<TokenRowProps> = React.memo(
  ({
    token,
    index,
    cotiBalance,
    onSelectToken,
    isDecrypted,
    onToggleDecryption,
    tokenBalance,
  }) => {
    const isCotiToken = useMemo(
      () => !token.address && token.symbol === 'COTI',
      [token.address, token.symbol],
    );

    // Strip "p." prefix for icon lookup so private tokens reuse the same icons
    const iconKey = token.symbol.replace(/^p\./i, '').toUpperCase();
    const TokenIcon = TOKEN_ICONS[iconKey] ?? null;

    return (
      <TokenRow onClick={() => onSelectToken(token)}>
        <TokenInfo>
          <TokenLogos>
            <TokenLogoBig>
              <TokenLogoWrapper>
                {TokenIcon ? (
                  <TokenIcon width={32} height={32} />
                ) : token.logoURI ? (
                  <img src={token.logoURI} alt={token.symbol} width={32} height={32} style={{ borderRadius: '50%' }} />
                ) : isCotiToken ? (
                  <CotiLogo />
                ) : (
                  token.symbol[0]
                )}
                {token.isPrivate && (
                  <LockBadge>
                    <Lock size={8} color="#ffffff" strokeWidth={3} />
                  </LockBadge>
                )}
              </TokenLogoWrapper>
            </TokenLogoBig>
          </TokenLogos>
          <TokenName>{token.name}</TokenName>
        </TokenInfo>
        <TokenValues>
          <Balance
            balance={
              token.symbol === 'COTI' ? cotiBalance || '0' : tokenBalance
            }
            currency={token.symbol}
            decimals={token.symbol === 'COTI' ? 18 : (token.decimals ?? 18)}
            isDecrypted={isDecrypted}
            onToggleDecryption={onToggleDecryption}
          />
        </TokenValues>
      </TokenRow>
    );
  },
);

TokenRowComponent.displayName = 'TokenRowComponent';
