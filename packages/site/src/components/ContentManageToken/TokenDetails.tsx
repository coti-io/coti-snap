import React, { useState, useCallback, useEffect } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../types/token';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import { useSnap } from '../../hooks/SnapContext';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useDropdown } from '../../hooks/useDropdown';
import { formatAddressForDisplay } from '../../utils/tokenValidation';
import { ConfirmationModal } from './components/ConfirmationModal';
import { truncateBalance } from '../../utils/formatters';
import { 
  TokenDetailsContainer,
  TokenDetailsContent,
  TokenDetailsRow,
  TokenDetailsLabel,
  TokenDetailsValue,
  TokenDetailsLink,
  BalanceContainer,
  BalanceTitle,
  TokenBalanceRow,
  TokenBalanceLeft,
  TokenBalanceLogoBox,
  TokenBalanceLogoBig,
  TokenBalanceLogoSmall,
  TokenBalanceName,
  TokenBalanceRight,
  TokenBalanceAmount,
  TokenBalanceSymbol,
  SendButton,
  TokenCircle,
  TokenNameRow,
  TokenNameText,
  AddressBadge,
  AddressCopyButton,
  IconButton,
  MenuDropdown,
  MenuItem,
} from './styles';
import ArrowBack from '../../assets/arrow-back.svg';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';
import VerticalMenuIcon from '../../assets/icons/vertical-menu.svg';
import { HeaderBar } from './styles';
import { HeaderBarSlotLeft, HeaderBarSlotRight } from './styles/transfer';
import TrashIcon from '../../assets/icons/trash.svg';

interface TokenDetailModalProps {
  token: ImportedToken | null;
  open: boolean;
  onClose: () => void;
  setActiveTab: React.Dispatch<React.SetStateAction<'tokens' | 'nfts'>>;
  setSelectedToken: React.Dispatch<React.SetStateAction<ImportedToken | null>>;
  provider: BrowserProvider;
  cotiBalance?: string;
  aesKey?: string | null | undefined;
  onSendClick?: (token: ImportedToken) => void;
}

const TokenDetails: React.FC<TokenDetailModalProps> = ({ 
  token, 
  open, 
  onClose,
  provider, 
  cotiBalance, 
  aesKey,
  onSendClick
}) => {
  const { userAESKey } = useSnap();
  const { decryptERC20Balance } = useTokenOperations(provider);
  const { importedTokens } = useImportedTokens();
  const [decryptedBalance, setDecryptedBalance] = useState<string>('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const { removeToken } = useImportedTokens();
  const menuDropdown = useDropdown();
  const [showHideModal, setShowHideModal] = useState(false);

  const effectiveAESKey = aesKey || userAESKey;

  const decryptBalance = useCallback(async () => {
    if (!token) return;
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
      setDecryptedBalance('(encrypted)');
    } finally {
      setIsDecrypting(false);
    }
  }, [token, effectiveAESKey, decryptERC20Balance, cotiBalance]);

  useEffect(() => {
    if (open && token) {
      decryptBalance();
    }
  }, [open, token, decryptBalance]);

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
  }, [copyToClipboard]);

  const handleRemoveToken = useCallback(() => {
    setShowHideModal(true);
    menuDropdown.close();
  }, [menuDropdown]);

  const handleSendToken = useCallback(() => {
    // TODO: Implement send token functionality
    console.log('Send token clicked');
    menuDropdown.close();
  }, [menuDropdown]);

  const handleSendClick = useCallback(() => {
    setShowSendModal(true);
  }, []);

  const handleCloseSendModal = useCallback(() => {
    setShowSendModal(false);
  }, []);

  const handleHideToken = useCallback(() => {
    if (token) {
      removeToken(token.address);
      setShowHideModal(false);
      onClose();
    }
  }, [token, removeToken, onClose]);

  const handleCancelHide = useCallback(() => {
    setShowHideModal(false);
  }, []);

  if (!open || !token) return null;

  const importedToken = importedTokens.find(
    importedToken => importedToken.address.toLowerCase() === token.address.toLowerCase() ||
    (importedToken.name === token.name && importedToken.symbol === token.symbol)
  );
  
  const tokenAddress = importedToken?.address || token.address;

  const shortAddress = tokenAddress ? formatAddressForDisplay(tokenAddress) : 'Native Token';
  const formattedBalance = isDecrypting ? 'Loading...' : `${decryptedBalance}`;

  return (
    <>
    <TokenDetailsContainer>
      <HeaderBar>
      <HeaderBarSlotLeft>
        <IconButton onClick={onClose} type="button" aria-label="Go back">
          <ArrowBack />
        </IconButton>
      </HeaderBarSlotLeft>
      <HeaderBarSlotRight style={{ position: 'relative' }}>
        <IconButton 
          onClick={menuDropdown.toggle}
          selected={menuDropdown.isOpen}
          type="button" 
          aria-label="Menu"
        >
          <VerticalMenuIcon />
        </IconButton>
        
        {menuDropdown.isOpen && token?.symbol !== 'COTI' && (
          <MenuDropdown ref={menuDropdown.ref}>
            <MenuItem onClick={handleRemoveToken} type="button">
              <TrashIcon />
              Hide {token.symbol}
            </MenuItem>
          </MenuDropdown>
        )}
      </HeaderBarSlotRight>
      </HeaderBar>

      <BalanceContainer>
        <BalanceTitle>Your balance</BalanceTitle>
        <TokenBalanceRow>
          <TokenBalanceLeft>
            <TokenBalanceLogoBox>
              <TokenBalanceLogoBig>{token.symbol[0]}</TokenBalanceLogoBig>
              <TokenBalanceLogoSmall>{token.symbol[0]}</TokenBalanceLogoSmall>
            </TokenBalanceLogoBox>
            <TokenBalanceName>{token.name}</TokenBalanceName>
          </TokenBalanceLeft>
          <TokenBalanceRight>
            <TokenBalanceAmount title={formattedBalance}>
              {truncateBalance(formattedBalance)}
            </TokenBalanceAmount>
            <TokenBalanceSymbol>{token.symbol}</TokenBalanceSymbol>
          </TokenBalanceRight>
        </TokenBalanceRow>
      </BalanceContainer>

      <TokenDetailsContent>
      <BalanceTitle>Token details</BalanceTitle>
        <TokenDetailsRow>
          <TokenDetailsLabel>Network</TokenDetailsLabel>
          <TokenDetailsValue>
            <TokenNameRow>
              <TokenCircle>C</TokenCircle>
              <TokenNameText>COTI</TokenNameText>
            </TokenNameRow>
        </TokenDetailsValue>
        </TokenDetailsRow>
        {token.symbol !== 'COTI' && (
          <TokenDetailsRow>
            <TokenDetailsLabel>Contract address</TokenDetailsLabel>
            <AddressBadge onClick={() => handleCopy(tokenAddress)}>
              <TokenDetailsLink>
                {shortAddress}
              </TokenDetailsLink>
              <AddressCopyButton>
                {copied ? (
                  <CopySuccessIcon />
                ) : (
                  <CopyIcon />
                )}
              </AddressCopyButton>
            </AddressBadge>
          </TokenDetailsRow>
        )}
        <TokenDetailsRow>
          <TokenDetailsLabel>Token decimals</TokenDetailsLabel>
          <TokenDetailsValue>{token.decimals}</TokenDetailsValue>
        </TokenDetailsRow>
      </TokenDetailsContent>
      <SendButton onClick={() => onSendClick && onSendClick(token)}>Send</SendButton>
    </TokenDetailsContainer>
    
    <ConfirmationModal
      isOpen={showHideModal}
      onClose={handleCancelHide}
      onConfirm={handleHideToken}
      title="Hide Token"
      message={`You can add this token back in the future by going to "Import token" in your accounts options menu.`}
      address={tokenAddress}
      symbol={`${token.symbol}`}
      confirmText="Hide"
      confirmButtonColor="#e53935"
      cancelText="Cancel"
    />
    </>
  );
};

export default TokenDetails;