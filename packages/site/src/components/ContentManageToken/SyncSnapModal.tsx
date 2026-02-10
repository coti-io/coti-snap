import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

import {
  ModalBackdrop,
  AnimatedModalContainer,
  ModalHeader,
  ModalClose,
  SendButton,
} from './styles';
import SpinnerIcon from '../../assets/spinner.png';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useInvokeSnap } from '../../hooks/useInvokeSnap';
import { useModal } from '../../hooks/useModal';
import type { ImportedToken } from '../../types/token';
import { parseNFTAddress } from '../../utils/tokenValidation';

type SyncStatus = 'pending' | 'syncing' | 'success' | 'skipped' | 'error';
type ModalPhase = 'ready' | 'syncing' | 'done';

type TokenSyncState = {
  token: ImportedToken;
  status: SyncStatus;
  message?: string;
};

type SyncSnapModalProps = {
  open: boolean;
  onClose: () => void;
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalBody = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Description = styled.p`
  font-size: 1.4rem;
  color: #6b7280 !important;
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
  border-radius: 12px;
  background: #f7f7f7;
  padding: 4px;
`;

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff;
  animation: ${fadeIn} 0.2s ease both;
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const TokenAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e29f6 !important;
  flex-shrink: 0;
`;

const TokenName = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: #000000 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const TokenType = styled.span`
  font-size: 1.1rem;
  color: #8a8f98 !important;
  font-weight: 400;
`;

const StatusIcon = styled.div<{ status: SyncStatus }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SpinnerImg = styled.img`
  width: 18px;
  height: 18px;
  animation: ${spin} 1s linear infinite;
`;

const SpinningSvg = styled.span`
  display: flex;
  animation: ${spin} 1s linear infinite;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: #1e29f6;
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 8px 0;
`;

const SummaryStat = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.3rem;
  font-weight: 500;
  color: ${({ color }) => color} !important;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #8a8f98 !important;
  font-size: 1.4rem;
`;

const ButtonArea = styled.div`
  padding: 0 24px 0 24px;

  button:focus,
  button:focus-visible {
    outline: none;
    box-shadow: none;
  }
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const getStatusIndicator = (status: SyncStatus) => {
  switch (status) {
    case 'syncing':
      return (
        <SpinningSvg>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle
              cx="9"
              cy="9"
              r="8"
              stroke="#e5e7eb"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M9 1a8 8 0 0 1 8 8"
              stroke="#1E29F6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </SpinningSvg>
      );
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#10b981" />
          <path
            d="M5.5 9.5L7.5 11.5L12.5 6.5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'skipped':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#e5e7eb" />
          <path
            d="M6 9h6"
            stroke="#8a8f98"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="9" fill="#e53935" />
          <path
            d="M6.5 6.5l5 5M11.5 6.5l-5 5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle
            cx="9"
            cy="9"
            r="8"
            stroke="#e5e7eb"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );
  }
};

export const SyncSnapModal: React.FC<SyncSnapModalProps> = React.memo(
  ({ open, onClose }) => {
    const { importedTokens } = useImportedTokens();
    const invokeSnap = useInvokeSnap();
    const [phase, setPhase] = useState<ModalPhase>('ready');
    const [tokenStates, setTokenStates] = useState<TokenSyncState[]>([]);
    const isSyncingRef = useRef(false);

    const resetState = useCallback(() => {
      setPhase('ready');
      setTokenStates([]);
      isSyncingRef.current = false;
    }, []);

    const { handleClose, handleBackdropClick, handleKeyDown } = useModal({
      isOpen: open,
      onClose,
      onReset: resetState,
    });

    useEffect(() => {
      if (open && importedTokens.length > 0) {
        setTokenStates(
          importedTokens.map((token) => ({ token, status: 'pending' })),
        );
      }
    }, [open, importedTokens]);

    const syncedCount = tokenStates.filter(
      (t) => t.status === 'success',
    ).length;
    const skippedCount = tokenStates.filter(
      (t) => t.status === 'skipped',
    ).length;
    const errorCount = tokenStates.filter((t) => t.status === 'error').length;
    const totalCount = tokenStates.length;
    const processedCount = syncedCount + skippedCount + errorCount;
    const progressPercent =
      totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

    const handleSync = useCallback(async () => {
      if (isSyncingRef.current || tokenStates.length === 0) {
        return;
      }
      isSyncingRef.current = true;
      setPhase('syncing');

      for (let i = 0; i < tokenStates.length; i++) {
        const { token } = tokenStates[i]!;

        setTokenStates((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'syncing' } : item,
          ),
        );

        try {
          const isNFT = token.type === 'ERC721' || token.type === 'ERC1155';
          let snapAddress = token.address;
          let snapTokenId: string | undefined;

          if (isNFT) {
            const parsed = parseNFTAddress(token.address);
            snapAddress = parsed.contractAddress;
            snapTokenId = parsed.tokenId || undefined;
          }

          await invokeSnap({
            method: 'import-token',
            params: {
              address: snapAddress,
              name: token.name,
              symbol: token.symbol,
              decimals: isNFT ? '0' : token.decimals?.toString() || '18',
              tokenType: token.type,
              ...(snapTokenId ? { tokenId: snapTokenId } : {}),
            },
          });

          setTokenStates((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: 'success' } : item,
            ),
          );
        } catch (err: any) {
          const msg = err?.message || '';
          const isAlreadyExists = msg.includes('already exists');

          setTokenStates((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: isAlreadyExists ? 'skipped' : 'error',
                    message: isAlreadyExists ? 'Already in snap' : msg,
                  }
                : item,
            ),
          );
        }
      }

      setPhase('done');
      isSyncingRef.current = false;
    }, [tokenStates, invokeSnap]);

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
          <ModalHeader>
            Sync to Snap
            <ModalClose
              onClick={handleClose}
              aria-label="Close modal"
              type="button"
            >
              &times;
            </ModalClose>
          </ModalHeader>

          <ModalBody>
            {phase === 'ready' && (
              <Description>
                Sync your imported tokens and NFTs to the COTI Snap so they
                appear inside COTI Snap.
              </Description>
            )}

            {tokenStates.length === 0 ? (
              <EmptyState>No tokens to sync. Import tokens first.</EmptyState>
            ) : (
              <>
                {(phase === 'syncing' || phase === 'done') && (
                  <ProgressBar>
                    <ProgressFill percent={progressPercent} />
                  </ProgressBar>
                )}

                <TokenList>
                  {tokenStates.map((item, idx) => (
                    <TokenRow key={item.token.address + idx}>
                      <TokenInfo>
                        <TokenAvatar>
                          {item.token.symbol.charAt(0).toUpperCase()}
                        </TokenAvatar>
                        <div>
                          <TokenName>
                            {item.token.name}{' '}
                            <TokenType>{item.token.symbol}</TokenType>
                          </TokenName>
                          <TokenType>{item.token.type}</TokenType>
                        </div>
                      </TokenInfo>
                      <StatusIcon status={item.status}>
                        {getStatusIndicator(item.status)}
                      </StatusIcon>
                    </TokenRow>
                  ))}
                </TokenList>

                {phase === 'done' && (
                  <SummaryRow>
                    {syncedCount > 0 && (
                      <SummaryStat color="#10b981">
                        <StatusDot color="#10b981" /> {syncedCount} synced
                      </SummaryStat>
                    )}
                    {skippedCount > 0 && (
                      <SummaryStat color="#8a8f98">
                        <StatusDot color="#d1d5db" /> {skippedCount} already
                        synced
                      </SummaryStat>
                    )}
                    {errorCount > 0 && (
                      <SummaryStat color="#e53935">
                        <StatusDot color="#e53935" /> {errorCount} failed
                      </SummaryStat>
                    )}
                  </SummaryRow>
                )}
              </>
            )}
          </ModalBody>

          <ButtonArea>
            {phase === 'ready' && tokenStates.length > 0 && (
              <SendButton onClick={handleSync} type="button">
                Sync {totalCount} {totalCount === 1 ? 'token' : 'tokens'}
              </SendButton>
            )}
            {phase === 'syncing' && (
              <SendButton disabled type="button">
                Syncing... {processedCount}/{totalCount}
              </SendButton>
            )}
            {phase === 'done' && (
              <SendButton
                onClick={handleClose}
                type="button"
                backgroundColor="#10b981"
              >
                Done
              </SendButton>
            )}
            {tokenStates.length === 0 && (
              <SendButton
                onClick={handleClose}
                type="button"
                backgroundColor="#fff"
                textColor="#1E29F6"
              >
                Close
              </SendButton>
            )}
          </ButtonArea>
        </AnimatedModalContainer>
      </ModalBackdrop>
    );
  },
);

SyncSnapModal.displayName = 'SyncSnapModal';
