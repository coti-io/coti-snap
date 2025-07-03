import React from 'react';
import {
  ModalBackdrop,
  DepositModalContainer,
  DepositCloseButton,
  DepositTitle,
  SendButton,
} from '../styles';
import { JazziconComponent } from '../../common';
import {
  ModalContent,
  IconContainer,
  SymbolText,
  MessageText,
  ButtonContainer,
} from './ConfirmationModal.styles';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  address?: string;
  symbol?: string;
  confirmText?: string;
  confirmButtonColor?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  address,
  symbol,
  confirmText = 'Confirm',
  confirmButtonColor = '#e53935',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <DepositModalContainer onClick={e => e.stopPropagation()}>
        <DepositCloseButton 
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          ×
        </DepositCloseButton>
        
        <DepositTitle>{title}</DepositTitle>
        
        <ModalContent>
          {address && (
            <IconContainer>
              <JazziconComponent address={address} />
            </IconContainer>
          )}
          {symbol && (
            <SymbolText>
              {symbol}
            </SymbolText>
          )}
          <MessageText>
            {message}
          </MessageText>
          
          <ButtonContainer>
            <SendButton
              onClick={onClose}
              backgroundColor="#fff"
              textColor="#4664ff"
              style={{ flex: 1 }}
            >
              {cancelText}
            </SendButton>
            <SendButton
              onClick={onConfirm}
              textColor="white"
              style={{ flex: 1 }}
            >
              {confirmText}
            </SendButton>
          </ButtonContainer>
        </ModalContent>
      </DepositModalContainer>
    </ModalBackdrop>
  );
};