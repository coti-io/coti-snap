import React from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../../types/token';
import { TokenRowComponent } from './TokenRow';
import { TransferContainerMain } from '../styles';

interface TokensTabContentProps {
  tokens: ImportedToken[];
  userHasAESKey: boolean;
  userAESKey: string | null;
  getAESKey: () => void;
  provider: BrowserProvider;
  cotiBalance?: string;
  propAESKey?: string | null | undefined;
  onSelectToken: (token: ImportedToken) => void;
  isDecrypted: boolean;
  onToggleDecryption: () => void;
  balances: Record<string, string>;
}

export const TokensTabContent: React.FC<TokensTabContentProps> = React.memo(({ 
  tokens, 
  provider, 
  cotiBalance, 
  propAESKey, 
  onSelectToken,
  isDecrypted,
  onToggleDecryption,
  balances 
}) => (
  <TransferContainerMain>
    {tokens.map((token, index) => (
      <TokenRowComponent 
        key={`${token.address}-${index}`} 
        token={token} 
        index={index}
        provider={provider}
        cotiBalance={cotiBalance}
        propAESKey={propAESKey}
        onSelectToken={onSelectToken}
        isDecrypted={isDecrypted}
        onToggleDecryption={onToggleDecryption}
        tokenBalance={balances[token.symbol] || '0'}
      />
    ))}
  </TransferContainerMain>
));

TokensTabContent.displayName = 'TokensTabContent';