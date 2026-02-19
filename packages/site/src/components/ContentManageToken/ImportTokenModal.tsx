import type { BrowserProvider } from '@coti-io/coti-ethers';
import React, { useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

import { ErrorText } from './components/ErrorText';
import {
  ModalBackdrop,
  AnimatedModalContainer,
  ModalHeader,
  ModalClose,
  ModalInput,
  ModalLabel,
  TokenSummaryBox,
  TokenSummaryLogo,
  TokenSummaryInfo,
  TokenSummaryName,
  TokenSummaryBalance,
  StepActions,
  CenteredText,
  SendButton,
  ImportTokenContent,
} from './styles';
import SpinnerIcon from '../../assets/spinner.png';
import { ERROR_MESSAGES } from '../../constants/token';
import { useSnap } from '../../hooks/SnapContext';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useModal } from '../../hooks/useModal';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import type { ImportedToken } from '../../types/token';
import { formatTokenBalance } from '../../utils/formatters';
import { normalizeAddress } from '../../utils/normalizeAddress';

const MODAL_STEPS = {
  ADDRESS_INPUT: 1,
  CONFIRMATION: 2,
} as const;

const MESSAGES = {
  AES_KEY_REQUIRED: 'AES key is required to read token information',
  NO_TOKEN_INFO: 'No token info available',
  TOKEN_ALREADY_IMPORTED: 'Token already imported',
  TOKEN_ALREADY_IMPORTED_ADDRESS:
    'This token address has already been imported',
  IMPORT_ERROR: 'Error importing token',
  METAMASK_DISCONNECTED:
    'Se perdió la conexión con MetaMask. Recarga la página.',
  LOADING_BALANCE: 'Loading balance...',
  VALIDATING: 'Validating...',
  IMPORTING: 'Importing...',
  CONFIRM_IMPORT: 'Would you like to import this token?',
} as const;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerImage = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
  <>
    <SpinnerImage src={SpinnerIcon} alt="Loading" />
    {text}
  </>
);

type ImportTokenModalProps = {
  open: boolean;
  onClose: () => void;
  provider: BrowserProvider;
  onImport?: (token: ImportedToken) => void;
};

type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
};

type ModalState = {
  address: string;
  addressStatus: 'idle' | 'error';
  isAddressValid: boolean;
  isAddressAlreadyImported: boolean;
  tokenInfo: TokenInfo | null;
  tokenInfoError: string | null;
  tokenInfoLoading: boolean;
  step: typeof MODAL_STEPS.ADDRESS_INPUT | typeof MODAL_STEPS.CONFIRMATION;
  balance: string;
  balanceLoading: boolean;
  importLoading: boolean;
};

const INITIAL_STATE: ModalState = {
  address: '',
  addressStatus: 'idle',
  isAddressValid: false,
  isAddressAlreadyImported: false,
  tokenInfo: null,
  tokenInfoError: null,
  tokenInfoLoading: false,
  step: MODAL_STEPS.ADDRESS_INPUT,
  balance: '',
  balanceLoading: false,
  importLoading: false,
};

const useImportTokenModal = () => {
  const [state, setState] = useState<ModalState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<ModalState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    updateState,
    resetState,
  };
};

export const ImportTokenModal: React.FC<ImportTokenModalProps> = React.memo(
  ({ open, onClose, provider, onImport }) => {
    const { getTokenInfo, decryptERC20Balance, addTokenToMetaMask } =
      useTokenOperations(provider);
    const { userAESKey, userHasAESKey } = useSnap();
    const { addToken, hasToken } = useImportedTokens();
    const { state, updateState, resetState } = useImportTokenModal();
    const { handleClose, handleBackdropClick, handleKeyDown } = useModal({
      isOpen: open,
      onClose,
      onReset: resetState,
    });

    const isNextButtonDisabled = useMemo(() => {
      return (
        !state.isAddressValid ||
        state.importLoading ||
        state.tokenInfoLoading ||
        state.isAddressAlreadyImported
      );
    }, [
      state.isAddressValid,
      state.importLoading,
      state.tokenInfoLoading,
      state.isAddressAlreadyImported,
    ]);

    const isImportButtonDisabled = useMemo(() => {
      return state.importLoading || !state.tokenInfo;
    }, [state.importLoading, state.tokenInfo]);

    const handleAddressChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value;

        const normalized = normalizeAddress(newAddress);
        const isValid = Boolean(normalized);
        const isAlreadyImported = isValid ? hasToken(normalized) : false;

        updateState({
          address: newAddress,
          addressStatus: isValid || !newAddress ? 'idle' : 'error',
          isAddressValid: isValid,
          isAddressAlreadyImported: isAlreadyImported,
          tokenInfo: null,
          tokenInfoError: null,
          tokenInfoLoading: false,
        });
      },
      [updateState, hasToken],
    );

    const handleNext = useCallback(async () => {
      if (!state.isAddressValid || !state.address) {
        return;
      }

      const normalized = normalizeAddress(state.address);
      if (!normalized) {
        return;
      }

      updateState({
        tokenInfoLoading: true,
        tokenInfoError: null,
      });

      try {
        if (!userHasAESKey) {
          updateState({
            tokenInfoLoading: false,
            tokenInfoError: MESSAGES.AES_KEY_REQUIRED,
          });
          return;
        }

        const tokenInfo = await getTokenInfo(normalized);

        updateState({
          tokenInfo,
          tokenInfoError: null,
          tokenInfoLoading: false,
          step: MODAL_STEPS.CONFIRMATION,
          balanceLoading: true,
        });

        const balance = await decryptERC20Balance(
          state.address,
          userAESKey || undefined,
          tokenInfo.decimals,
        );

        updateState({
          balance: balance.toString(),
          balanceLoading: false,
        });
      } catch (error) {
        void error;
        let errorMessage = 'Error reading token information';

        if (error instanceof Error) {
          if (
            error.message.includes('missing revert data') ||
            error.message.includes('CALL_EXCEPTION') ||
            error.message.includes('Invalid token contract')
          ) {
            errorMessage =
              'Invalid token contract address. Please verify this is a valid ERC20 token on the current network.';
          } else {
            errorMessage = error.message;
          }
        }

        updateState({
          tokenInfo: null,
          tokenInfoError: errorMessage,
          tokenInfoLoading: false,
          balance: '0',
          balanceLoading: false,
          step: MODAL_STEPS.ADDRESS_INPUT,
        });
      }
    }, [
      state.isAddressValid,
      state.address,
      userHasAESKey,
      getTokenInfo,
      decryptERC20Balance,
      updateState,
    ]);

    const handleBack = useCallback(() => {
      updateState({ step: MODAL_STEPS.ADDRESS_INPUT });
    }, [updateState]);

    const handleImportClick = useCallback(async () => {
      if (!state.tokenInfo) {
        updateState({ tokenInfoError: MESSAGES.NO_TOKEN_INFO });
        return;
      }

      if (hasToken(state.address)) {
        updateState({ tokenInfoError: MESSAGES.TOKEN_ALREADY_IMPORTED });
        return;
      }

      updateState({ importLoading: true, tokenInfoError: null });

      try {
        const decimals =
          typeof state.tokenInfo.decimals === 'bigint'
            ? Number(state.tokenInfo.decimals)
            : state.tokenInfo.decimals;

        const addTokenResult = await addTokenToMetaMask({
          address: state.address,
          symbol: state.tokenInfo.symbol,
          decimals,
          image: '',
        });

        if (addTokenResult) {
          const importedToken: ImportedToken = {
            address: state.address,
            name: state.tokenInfo.name,
            symbol: state.tokenInfo.symbol,
            decimals,
            type: 'ERC20',
          };

          addToken(importedToken);
          onImport?.(importedToken);

          handleClose();
        } else {
          updateState({ tokenInfoError: MESSAGES.IMPORT_ERROR });
        }
      } catch (error: any) {
        void error;
        if (error.message?.includes('Disconnected from MetaMask background')) {
          updateState({ tokenInfoError: MESSAGES.METAMASK_DISCONNECTED });
        } else {
          updateState({ tokenInfoError: MESSAGES.IMPORT_ERROR });
        }
      } finally {
        updateState({ importLoading: false });
      }
    }, [
      state.tokenInfo,
      state.address,
      state.balance,
      addTokenToMetaMask,
      onImport,
      updateState,
      hasToken,
      addToken,
      handleClose,
    ]);

    if (!open) {
      return null;
    }

    return (
      <ModalBackdrop onClick={handleBackdropClick}>
        <AnimatedModalContainer
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {state.step === MODAL_STEPS.ADDRESS_INPUT && (
            <>
              <ModalHeader>
                Import
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
                  disabled={state.importLoading}
                  aria-describedby={
                    state.addressStatus === 'error'
                      ? 'address-error'
                      : undefined
                  }
                />

                {state.addressStatus === 'error' && state.address && (
                  <ErrorText
                    message={ERROR_MESSAGES.INVALID_ADDRESS}
                    className="address-error"
                  />
                )}

                {state.isAddressAlreadyImported && (
                  <ErrorText
                    message={MESSAGES.TOKEN_ALREADY_IMPORTED_ADDRESS}
                  />
                )}

                {state.tokenInfoError && !state.tokenInfoLoading && (
                  <ErrorText message={state.tokenInfoError} />
                )}

                <SendButton
                  disabled={isNextButtonDisabled}
                  onClick={handleNext}
                >
                  {state.tokenInfoLoading ? (
                    <LoadingSpinner text={MESSAGES.VALIDATING} />
                  ) : (
                    'Next'
                  )}
                </SendButton>
              </ImportTokenContent>
            </>
          )}

          {state.step === MODAL_STEPS.CONFIRMATION && state.tokenInfo && (
            <>
              <ModalHeader>
                Import
                <ModalClose
                  onClick={handleClose}
                  aria-label="Close modal"
                  type="button"
                >
                  ×
                </ModalClose>
              </ModalHeader>

              <CenteredText>{MESSAGES.CONFIRM_IMPORT}</CenteredText>

              <TokenSummaryBox>
                <TokenSummaryLogo>{state.tokenInfo.name[0]}</TokenSummaryLogo>
                <TokenSummaryInfo>
                  <TokenSummaryName>{state.tokenInfo.name}</TokenSummaryName>
                  <TokenSummaryBalance>
                    {state.balanceLoading
                      ? MESSAGES.LOADING_BALANCE
                      : `${formatTokenBalance(state.balance, state.tokenInfo.decimals)} ${state.tokenInfo.symbol}`}
                  </TokenSummaryBalance>
                </TokenSummaryInfo>
              </TokenSummaryBox>

              <StepActions>
                <SendButton
                  onClick={handleBack}
                  disabled={state.importLoading}
                  type="button"
                  backgroundColor="#fff"
                  textColor="#1E29F6"
                >
                  Back
                </SendButton>
                <SendButton
                  onClick={handleImportClick}
                  disabled={isImportButtonDisabled}
                  type="button"
                >
                  {state.importLoading ? MESSAGES.IMPORTING : 'Import'}
                </SendButton>
              </StepActions>
            </>
          )}
        </AnimatedModalContainer>
      </ModalBackdrop>
    );
  },
);

ImportTokenModal.displayName = 'ImportTokenModal';
