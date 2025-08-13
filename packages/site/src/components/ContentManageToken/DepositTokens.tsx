import React, { useCallback, useMemo } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';
import {
  DepositModalContainer,
  DepositCloseButton,
  DepositTitle,
  DepositQRWrapper,
  DepositAccountName,
  DepositAccountAddress,
  DepositCopyIconWrapper,
  DepositCopyButton,
  DepositHeader,
  DepositHeaderSpacer,
  DepositBorderWrapper
} from './styles';

interface DepositTokensProps {
  onClose: () => void;
  address: string;
  accountName?: string;
}

const QR_SIZE = 320;

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
    <DepositBorderWrapper>
      <DepositModalContainer onKeyDown={handleKeyDown} tabIndex={-1}>
        <DepositHeader>
          <DepositHeaderSpacer />
          <DepositTitle>Receive</DepositTitle>
          <DepositCloseButton
            aria-label="Close deposit modal"
            onClick={handleClose}
            type="button"
          >
            ×
          </DepositCloseButton>
        </DepositHeader>

        <DepositQRWrapper>
          <QRCode
            value={qrCodeValue}
            size={QR_SIZE}
            qrStyle="squares"
            eyeRadius={0}
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
    </DepositBorderWrapper>
  );
});

DepositTokens.displayName = 'DepositTokens';