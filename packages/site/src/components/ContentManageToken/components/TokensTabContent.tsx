import React from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../../types/token';
import { TokenRowComponent } from './TokenRow';
import { TransferContainer } from '../styles';

interface TokensTabContentProps {
  tokens: ImportedToken[];
  userHasAESKey: boolean;
  userAESKey: string | null;
  getAESKey: () => void;
  provider: BrowserProvider;
  cotiBalance?: string;
  propAESKey?: string | null | undefined;
  onSelectToken: (token: ImportedToken) => void;
}

export const TokensTabContent: React.FC<TokensTabContentProps> = React.memo(({ 
  tokens, 
  provider, 
  cotiBalance, 
  propAESKey, 
  onSelectToken 
}) => (
  <TransferContainer>
    {tokens.map((token, index) => (
      <TokenRowComponent 
        key={`${token.address}-${index}`} 
        token={token} 
        index={index}
        provider={provider}
        cotiBalance={cotiBalance}
        propAESKey={propAESKey}
        onSelectToken={onSelectToken}
      />
    ))}
  </TransferContainer>
));

TokensTabContent.displayName = 'TokensTabContent';