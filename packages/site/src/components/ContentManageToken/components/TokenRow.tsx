import React, { useState, useCallback, useMemo } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { useTokenOperations } from '../../../hooks/useTokenOperations';
import { useSnap } from '../../../hooks/SnapContext';
import { ImportedToken } from '../../../types/token';
import { formatBalance } from '../../../utils/formatters';
import { 
  TokenRow, 
  TokenInfo, 
  TokenLogos, 
  TokenLogoBig, 
  TokenLogoSmall, 
  TokenName, 
  TokenValues, 
  TokenAmount 
} from '../styles';

interface TokenRowProps {
  token: ImportedToken;
  index: number;
  provider: BrowserProvider;
  cotiBalance?: string | undefined;
  propAESKey?: string | null | undefined;
  onSelectToken: (token: ImportedToken) => void;
}

export const TokenRowComponent: React.FC<TokenRowProps> = React.memo(({ 
  token, 
  index, 
  provider, 
  cotiBalance, 
  propAESKey, 
  onSelectToken 
}) => {
  const { userAESKey } = useSnap();
  const effectiveAESKey = propAESKey || userAESKey;
  const { decryptERC20Balance } = useTokenOperations(provider);
  const [decryptedBalance, setDecryptedBalance] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const decryptBalance = useCallback(async () => {
    if (!token.address) {
      setDecryptedBalance(cotiBalance || '0');
      return;
    }
    
    if (!effectiveAESKey) {
      setDecryptedBalance('(encrypted)');
      return;
    }
    
    setIsDecrypting(true);
    try {
      const balance = await decryptERC20Balance(token.address, effectiveAESKey);
      setDecryptedBalance(`${balance}`);
    } catch (error) {
      console.error('Error decrypting balance:', error);
      setDecryptedBalance('(encrypted)');
    } finally {
      setIsDecrypting(false);
    }
  }, [token.address, effectiveAESKey, decryptERC20Balance, cotiBalance]);

  React.useEffect(() => {
    setDecryptedBalance('');
    setIsDecrypting(false);
  }, [token.address]);

  React.useEffect(() => {
    decryptBalance();
  }, [decryptBalance]);

  const formattedBalance = useMemo(() => {
    if (isDecrypting) return 'Loading...';
    return formatBalance(decryptedBalance || '0');
  }, [decryptedBalance, isDecrypting]);

  const tokenKey = useMemo(() => 
    token.address || `${token.symbol}-${index}`, 
    [token.address, token.symbol, index]
  );

  return (
    <TokenRow key={tokenKey} onClick={() => onSelectToken(token)}>
      <TokenInfo>
        <TokenLogos>
          <TokenLogoBig>{token.symbol[0]}</TokenLogoBig>
          <TokenLogoSmall>{token.symbol[0]}</TokenLogoSmall>
        </TokenLogos>
        <TokenName>{token.name}</TokenName>
      </TokenInfo>
      <TokenValues>
        <TokenAmount>
          {formattedBalance} {token.symbol}
        </TokenAmount>
      </TokenValues>
    </TokenRow>
  );
});

TokenRowComponent.displayName = 'TokenRowComponent';