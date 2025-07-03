import React, { useCallback, useMemo } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';
import MetamaskLogo from '../../assets/images/metamask-fox.png';
import {
  DepositModalContainer,
  DepositCloseButton,
  DepositTitle,
  DepositQRWrapper,
  DepositAccountName,
  DepositAccountAddress,
  DepositCopyIconWrapper,
  DepositCopyButton
} from './styles';

interface DepositTokensProps {
  onClose: () => void;
  address: string;
  accountName?: string;
}

const QR_SIZE = 150;
const LOGO_SIZE = 32;
const LOGO_PADDING = 5;

export const DepositTokens: React.FC<DepositTokensProps> = React.memo(({ 
  onClose, 
  address, 
  accountName 
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard({ successDuration: 1500 });

  const formattedAddress = useMemo(() => {
    if (!address) return '';
    return address;
  }, [address]);

  const qrCodeValue = useMemo(() => address, [address]);

  const handleCopy = useCallback(() => {
    copyToClipboard(address);
  }, [copyToClipboard, address]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!address) {
    return null;
  }

  return (
    <DepositModalContainer onKeyDown={handleKeyDown} tabIndex={-1}>
      <DepositCloseButton 
        aria-label="Cerrar modal de depósito" 
        onClick={handleClose}
        type="button"
      >
        ×
      </DepositCloseButton>
      
      <DepositTitle>Receive</DepositTitle>
      
      <DepositQRWrapper>
        <QRCode 
          value={qrCodeValue} 
          size={QR_SIZE} 
          logoImage={MetamaskLogo} 
          logoWidth={LOGO_SIZE} 
          logoHeight={LOGO_SIZE} 
          logoPadding={LOGO_PADDING}
          logoPaddingStyle='square'
          qrStyle="dots"
          eyeRadius={8}
          quietZone={10}
        />
      </DepositQRWrapper>
      
      {accountName && (
        <DepositAccountName>{accountName}</DepositAccountName>
      )}
      
      <DepositAccountAddress title={address}>
        {formattedAddress}
      </DepositAccountAddress>
      
      <DepositCopyButton 
        onClick={handleCopy}
        $copied={copied}
        type="button"
        aria-label={copied ? "Address copied" : "Copy address"}
      >
        <DepositCopyIconWrapper>
          {copied ? <CopySuccessIcon /> : <CopyIcon />}
        </DepositCopyIconWrapper>
        Copy address
      </DepositCopyButton>
    </DepositModalContainer>
  );
});

DepositTokens.displayName = 'DepositTokens';