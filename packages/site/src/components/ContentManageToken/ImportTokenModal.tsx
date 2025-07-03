import React, { useState, useCallback, useMemo } from 'react';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useModal } from '../../hooks/useModal';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { normalizeAddress } from '../../utils/normalizeAddress';
import { useSnap } from '../../hooks/SnapContext';
import { ImportedToken } from '../../types/token';
import { ERROR_MESSAGES } from '../../constants/token';
import {
  ModalBackdrop,
  AnimatedModalContainer,
  ModalHeader,
  ModalClose,
  ModalInput,
  ModalLabel,
  TokenInfoBox,
  TokenInfoRow,
  TokenInfoValue,
  TokenSummaryBox,
  TokenSummaryLogo,
  TokenSummaryInfo,
  TokenSummaryName,
  TokenSummaryBalance,
  StepActions,
  CenteredText,
  SendButton,
  ImportTokenContent
} from './styles';
import { ErrorText } from './components/ErrorText';

interface ImportTokenModalProps {
  open: boolean;
  onClose: () => void;
  provider: BrowserProvider;
  onImport?: (token: ImportedToken) => void;
}

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

interface ModalState {
  address: string;
  addressStatus: 'idle' | 'error';
  isAddressValid: boolean;
  tokenInfo: TokenInfo | null;
  tokenInfoError: string | null;
  step: 1 | 2;
  balance: string;
  balanceLoading: boolean;
  importLoading: boolean;
}

const useImportTokenModal = () => {
  const [state, setState] = useState<ModalState>({
    address: '',
    addressStatus: 'idle',
    isAddressValid: false,
    tokenInfo: null,
    tokenInfoError: null,
    step: 1,
    balance: '',
    balanceLoading: false,
    importLoading: false
  });

  const updateState = useCallback((updates: Partial<ModalState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      address: '',
      addressStatus: 'idle',
      isAddressValid: false,
      tokenInfo: null,
      tokenInfoError: null,
      step: 1,
      balance: '',
      balanceLoading: false,
      importLoading: false
    });
  }, []);

  return {
    state,
    updateState,
    resetState
  };
};

export const ImportTokenModal: React.FC<ImportTokenModalProps> = React.memo(({ 
  open, 
  onClose, 
  provider, 
  onImport 
}) => {
  const { getTokenInfo, decryptERC20Balance, addTokenToMetaMask } = useTokenOperations(provider);
  const { userAESKey, userHasAESKey } = useSnap();
  const { addToken, hasToken } = useImportedTokens();
  const { state, updateState, resetState } = useImportTokenModal();
  const { handleClose, handleBackdropClick, handleKeyDown } = useModal({
    isOpen: open,
    onClose,
    onReset: resetState
  });

  const isNextButtonDisabled = useMemo(() => {
    return !state.isAddressValid || state.importLoading;
  }, [state.isAddressValid, state.importLoading]);

  const isImportButtonDisabled = useMemo(() => {
    return state.importLoading || !state.tokenInfo;
  }, [state.importLoading, state.tokenInfo]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    updateState({
      address: newAddress,
      addressStatus: 'idle',
      isAddressValid: false,
      tokenInfo: null,
      tokenInfoError: null
    });
  }, [updateState]);

  const handleAddressBlur = useCallback(async () => {
    if (!state.address) {
      updateState({
        tokenInfo: null,
        tokenInfoError: null
      });
      return;
    }

    const normalized = normalizeAddress(state.address);
    if (!normalized) {
      updateState({
        addressStatus: 'error',
        isAddressValid: false,
        tokenInfo: null,
        tokenInfoError: null
      });
      return;
    }

    updateState({
      addressStatus: 'idle',
      isAddressValid: true
    });

    try {
      console.log("User Has AES Key", userHasAESKey);
      console.log("AES Key is: ", userAESKey);
      
      if (!userHasAESKey) {
        console.log("No AES Key available");
        return;
      }

      const tokenInfo = await getTokenInfo(normalized);
      updateState({
        tokenInfo,
        tokenInfoError: null
      });
    } catch (error) {
      console.error('Error reading token information:', error);
      updateState({
        tokenInfo: null,
        tokenInfoError: 'Error reading token information'
      });
    }
  }, [state.address, userHasAESKey, userAESKey, getTokenInfo, updateState]);

  const handleNext = useCallback(async () => {
    if (!state.tokenInfo || !state.address) return;
    
    updateState({ step: 2, balanceLoading: true });
    
    try {
      // Get decrypted balance for display
      const balance = await decryptERC20Balance(state.address, userAESKey || undefined);
      console.log("balance", balance);
      
      // Get encrypted balance for storage
      const encryptedBalance = await decryptERC20Balance(state.address);
      console.log("encryptedBalance", encryptedBalance);
      
      updateState({ 
        balance: `${balance}`
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      updateState({ balance: '0' });
    } finally {
      updateState({ balanceLoading: false });
    }
  }, [state.tokenInfo, state.address, userAESKey, decryptERC20Balance, updateState]);

  const handleBack = useCallback(() => {
    updateState({ step: 1 });
  }, [updateState]);

  const handleImportClick = useCallback(async () => {
    if (!state.tokenInfo) {
      updateState({ tokenInfoError: 'No token info available' });
      return;
    }

    // Check if token already exists
    if (hasToken(state.address)) {
      updateState({ tokenInfoError: 'Token already imported' });
      return;
    }

    updateState({ importLoading: true, tokenInfoError: null });

    try {
      const decimals = typeof state.tokenInfo.decimals === 'bigint' 
        ? Number(state.tokenInfo.decimals) 
        : state.tokenInfo.decimals;

      const addTokenResult = await addTokenToMetaMask({
        address: state.address,
        symbol: state.tokenInfo.symbol,
        decimals,
        image: ''
      });

      if (addTokenResult) {
        const importedToken: ImportedToken = {
          address: state.address,
          name: state.tokenInfo.name,
          symbol: state.tokenInfo.symbol,
          decimals,
          type: 'ERC20'
        };
        
        // Add to localStorage
        addToken(importedToken);
        
        // Call the onImport callback if provided
        onImport?.(importedToken);
        
        handleClose();
      } else {
        updateState({ tokenInfoError: 'Error importing token' });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      if (error.message?.includes('Disconnected from MetaMask background')) {
        updateState({ tokenInfoError: 'Se perdió la conexión con MetaMask. Recarga la página.' });
      } else {
        updateState({ tokenInfoError: 'Error importing token' });
      }
    } finally {
      updateState({ importLoading: false });
    }
  }, [state.tokenInfo, state.address, state.balance, addTokenToMetaMask, onImport, updateState, hasToken, addToken, handleClose]);


  if (!open) return null;

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <AnimatedModalContainer onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown} tabIndex={-1}>
        {state.step === 1 && (
          <>
            <ModalHeader>
              Import tokens
              <ModalClose 
                onClick={handleClose} 
                aria-label="Close modal"
                type="button"
              >
                ×
              </ModalClose>
            </ModalHeader>
            
            <ImportTokenContent>
              <ModalLabel>Token contract address</ModalLabel>
              <ModalInput
                placeholder="0x..."
                value={state.address}
                onChange={handleAddressChange}
                onBlur={handleAddressBlur}
                disabled={state.importLoading}
                aria-describedby={state.addressStatus === 'error' ? 'address-error' : undefined}
              />
              
              {state.addressStatus === 'error' && state.address && (
                <ErrorText 
                  message={ERROR_MESSAGES.INVALID_ADDRESS}
                  className="address-error"
                />
              )}
              
              {state.tokenInfo && (
                <>
                  <ModalLabel>Name</ModalLabel>
                  <TokenInfoBox>
                    <TokenInfoRow>
                      <TokenInfoValue>{state.tokenInfo.name}</TokenInfoValue>
                    </TokenInfoRow>
                  </TokenInfoBox>
                  
                  <ModalLabel>Symbol</ModalLabel>
                  <TokenInfoBox>
                    <TokenInfoRow>
                      <TokenInfoValue>{state.tokenInfo.symbol}</TokenInfoValue>
                    </TokenInfoRow>
                  </TokenInfoBox>
                </>
              )}
              
              {state.tokenInfoError && (
                <ErrorText 
                  message={state.tokenInfoError}
                />
              )}
              
              <SendButton 
                disabled={isNextButtonDisabled} 
                onClick={handleNext}
              >
                Next
              </SendButton>
            </ImportTokenContent>
          </>
        )}
        
        {state.step === 2 && state.tokenInfo && (
          <>
            <ModalHeader>
              Import tokens
              <ModalClose 
                onClick={handleClose} 
                aria-label="Close modal"
                type="button"
              >
                ×
              </ModalClose>
            </ModalHeader>
            
            <CenteredText>
              Would you like to import this token?
            </CenteredText>
            
            <TokenSummaryBox>
              <TokenSummaryLogo>
                {state.tokenInfo.name[0]}
              </TokenSummaryLogo>
              <TokenSummaryInfo>
                <TokenSummaryName>{state.tokenInfo.name}</TokenSummaryName>
                <TokenSummaryBalance>
                  {state.balanceLoading 
                    ? 'Loading balance...' 
                    : `${state.balance} ${state.tokenInfo.symbol}`
                  }
                </TokenSummaryBalance>
              </TokenSummaryInfo>
            </TokenSummaryBox>
            
            <StepActions>
              <SendButton 
                onClick={handleBack}
                disabled={state.importLoading}
                type="button"
                backgroundColor="#fff"
                textColor="#4664ff"
              >
                Back
              </SendButton>
              <SendButton
                onClick={handleImportClick} 
                disabled={isImportButtonDisabled}
                type="button"
              >
                {state.importLoading ? 'Importing...' : 'Import'}
              </SendButton>
            </StepActions>
          </>
        )}
      </AnimatedModalContainer>
    </ModalBackdrop>
  );
});

ImportTokenModal.displayName = 'ImportTokenModal'; 