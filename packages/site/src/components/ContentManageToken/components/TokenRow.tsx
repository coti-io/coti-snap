import React, { useMemo } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../../types/token';
import { formatBalance } from '../../../utils/formatters';
import {CotiLogo} from '../../../assets/icons';
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
  provider, 
  cotiBalance, 
  propAESKey, 
  onSelectToken,
  isDecrypted,
  onToggleDecryption,
  tokenBalance 
}) => {
  const formattedBalance = useMemo(() => {
    const balance = token.symbol === 'COTI' ? (cotiBalance || '0') : tokenBalance;
    
    
    if (!isDecrypted) return '(encrypted)';
    
    // Format balance considering decimals (only for raw integer balances)
    if (balance && balance !== '0' && token.decimals && token.symbol !== 'COTI') {
      // Check if balance is a raw integer (no decimal point)
      if (!balance.includes('.') && /^\d+$/.test(balance)) {
        const balanceNumber = BigInt(balance);
        const divisor = BigInt(10 ** token.decimals);
        const wholePart = balanceNumber / divisor;
        const fractionalPart = balanceNumber % divisor;
        
        // Convert to readable format
        const wholeStr = wholePart.toString();
        const fractionalStr = fractionalPart.toString().padStart(token.decimals, '0');
        const trimmedFractional = fractionalStr.replace(/0+$/, '').slice(0, 6); // Max 6 decimal places
        
        return trimmedFractional.length > 0 ? `${wholeStr}.${trimmedFractional}` : wholeStr;
      }
    }
    
    return formatBalance(balance);
  }, [tokenBalance, cotiBalance, isDecrypted, token.symbol, token.decimals]);

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
              <CotiLogo/>
            ) : (
              token.symbol[0]
            )}
          </TokenLogoBig>
        </TokenLogos>
        <TokenName>{token.name}</TokenName>
      </TokenInfo>
      <TokenValues>
        <Balance
          balance={formattedBalance}
          currency={token.symbol}
          isDecrypted={isDecrypted}
          onToggleDecryption={onToggleDecryption}
        />
      </TokenValues>
    </TokenRow>
  );
});

TokenRowComponent.displayName = 'TokenRowComponent';