import { BrowserProvider } from '@coti-io/coti-ethers';
import { formatUnits } from 'ethers';
import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAccount, useBalance } from 'wagmi';

import './transitions.css';
import { BalanceDisplay } from './components/BalanceDisplay';
import { ContentWrapper } from './ContentWrapper';
import { DepositTokens } from './DepositTokens';
import { DisplayAESKey } from './DisplayAESKey';
import NFTDetails from './NFTDetails';
import { RequestAESKey } from './RequestAESKey';
import {
  QuickAccessButton,
  QuickAccessGroup,
  QuickAccessItem,
  QuickAccessLabel,
  MainStack,
  HeaderBar,
  IconButton,
  TokenDetailsContainer,
  AddressBadge,
  AddressCopyButton,
  TokenDetailsLink,
} from './styles';
import { HeaderBarSlotLeft } from './styles/transfer';
import TokenDetails from './TokenDetails';
import { Tokens } from './Tokens';
import { TransferTokens } from './TransferTokens';
import ArrowBack from '../../assets/arrow-back.svg';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';
import ReceiveIcon from '../../assets/receive.svg';
import SendIcon from '../../assets/send.svg';
import { getNetworkConfig } from '../../config/networks';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useMetaMaskContext } from '../../hooks/MetamaskContext';
import { useSnap } from '../../hooks/SnapContext';
import type { ImportedToken } from '../../types/token';
import { formatAddressForDisplay } from '../../utils/tokenValidation';
import { ButtonAction } from '../Button';
import { DeleteAESKey } from '../ContentManageAESKey/DeleteAESKey';
import { Loading } from '../Loading';

type ModalState = {
  transfer: boolean;
  deposit: boolean;
};

const slideUpFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(48px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(24, 25, 29, 0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AnimatedModalWrapper = styled.div`
  animation: ${slideUpFadeIn} 0.32s cubic-bezier(0.4, 0.8, 0.4, 1) both;
`;

const QuickAccessActions = memo(
  ({
    onSendClick,
    onReceiveClick,
  }: {
    onSendClick: () => void;
    onReceiveClick: () => void;
  }) => (
    <QuickAccessGroup>
      <QuickAccessItem>
        <QuickAccessButton onClick={onSendClick} aria-label="Send tokens">
          <SendIcon />
        </QuickAccessButton>
        <QuickAccessLabel>Send</QuickAccessLabel>
      </QuickAccessItem>
      <QuickAccessItem>
        <QuickAccessButton onClick={onReceiveClick} aria-label="Receive tokens">
          <ReceiveIcon />
        </QuickAccessButton>
        <QuickAccessLabel>Receive</QuickAccessLabel>
      </QuickAccessItem>
    </QuickAccessGroup>
  ),
);

QuickAccessActions.displayName = 'QuickAccessActions';

const DepositModal = memo(
  ({
    isOpen,
    onClose,
    address,
  }: {
    isOpen: boolean;
    onClose: () => void;
    address: string;
  }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <ModalBackdrop
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <AnimatedModalWrapper>
          <DepositTokens onClose={onClose} address={address} />
        </AnimatedModalWrapper>
      </ModalBackdrop>
    );
  },
);

DepositModal.displayName = 'DepositModal';

const SuccessCheckCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #d4edda;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto 0;
`;

const SuccessCheckMark = styled.span`
  font-size: 32px;
  color: #28a745 !important;
  line-height: 1;
`;

const SuccessTitle = styled.p`
  margin: 0;
  font-size: 2rem;
  line-height: 1.45;
  color: #04133d !important;
  font-weight: 600;
  text-align: center;
`;

const SuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 0 16px;
`;

const SuccessDetailRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const SuccessDetailLabel = styled.span`
  font-size: 1.4rem;
  color: #6b7280 !important;
  font-weight: 500;
`;

type ContentManageTokenProps = {
  aesKey?: string | null;
};

export const ContentManageToken: React.FC<ContentManageTokenProps> = memo(
  ({ aesKey }) => {
    const { address, chain } = useAccount();
    const { data: balance, refetch: refetchBalance } = useBalance({ address });
    const { provider } = useMetaMaskContext();
    const { getAESKey, userAESKey, userHasAESKey } = useSnap();
    const { copied, copyToClipboard } = useCopyToClipboard();

    const currentAESKey = userAESKey || aesKey;
    const [isRequestingAESKey, setIsRequestingAESKey] = useState(false);
    const [showAESKeyDisplay, setShowAESKeyDisplay] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [transferSuccessHash, setTransferSuccessHash] = useState<
      string | null
    >(null);

    const [modalState, setModalState] = useState<ModalState>({
      transfer: false,
      deposit: false,
    });

    const [selectedNFT, setSelectedNFT] = useState<ImportedToken | null>(null);
    const [selectedToken, setSelectedToken] = useState<ImportedToken | null>(
      null,
    );
    const [transferToken, setTransferToken] = useState<ImportedToken | null>(
      null,
    );

    const prevAddressRef = useRef<string | undefined>();
    const previousChainIdRef = useRef<number | null>(null);
    const acknowledgedChainsRef = useRef<Record<number, boolean>>({});
    const currentChainId = typeof chain?.id === 'number' ? chain.id : null;

    useEffect(() => {
      const hasAddressChanged = prevAddressRef.current !== address;
      const hasChainChanged =
        previousChainIdRef.current !== null &&
        currentChainId !== null &&
        previousChainIdRef.current !== currentChainId;

      if (previousChainIdRef.current !== null && currentChainId === null) {
        setIsRequestingAESKey(false);
        setShowAESKeyDisplay(false);
        setShowDeleteConfirmation(false);
        setModalState({ transfer: false, deposit: false });
        setSelectedNFT(null);
        setSelectedToken(null);
        setTransferToken(null);
        previousChainIdRef.current = null;
        acknowledgedChainsRef.current = {};
        return;
      }

      if (hasAddressChanged || hasChainChanged) {
        setIsRequestingAESKey(false);
        setShowAESKeyDisplay(false);
        setShowDeleteConfirmation(false);
        setModalState({ transfer: false, deposit: false });
        setSelectedNFT(null);
        setSelectedToken(null);
        setTransferToken(null);
        prevAddressRef.current = address;
        previousChainIdRef.current = currentChainId;
        if (hasAddressChanged) {
          acknowledgedChainsRef.current = {};
        }
        return;
      }
      if (prevAddressRef.current === undefined && address) {
        prevAddressRef.current = address;
      }
      if (previousChainIdRef.current === null && currentChainId !== null) {
        previousChainIdRef.current = currentChainId;
      }
    }, [address, currentChainId]);

    useEffect(() => {
      if (currentChainId === null) {
        setShowAESKeyDisplay(false);
        return;
      }

      if (acknowledgedChainsRef.current[currentChainId]) {
        return;
      }

      if (userHasAESKey && (currentAESKey || userAESKey)) {
        setShowAESKeyDisplay(true);
      }
    }, [currentChainId, userHasAESKey, currentAESKey, userAESKey]);

    const formattedBalance = useMemo(() => {
      if (!balance) {
        return '0';
      }
      try {
        const formatted = formatUnits(balance.value, 18);
        return formatted || '0';
      } catch (error) {
        return '0';
      }
    }, [balance]);

    const browserProvider = useMemo(() => {
      if (typeof window !== 'undefined' && window.ethereum) {
        return new BrowserProvider(window.ethereum);
      }
      return null;
    }, []);

    const isWalletConnected = address && balance && provider;
    const shouldShowConnectWallet = !isWalletConnected;

    const handleSendClick = useCallback(() => {
      setTransferSuccessHash(null);
      setModalState((prev) => ({ ...prev, transfer: true }));
    }, []);

    const handleTokenSendClick = useCallback((token: ImportedToken) => {
      setTransferSuccessHash(null);
      setTransferToken(token);
      setModalState((prev) => ({ ...prev, transfer: true }));
    }, []);

    const handleNFTSendClick = useCallback((nft: ImportedToken) => {
      setTransferSuccessHash(null);
      setTransferToken(nft);
      setModalState((prev) => ({ ...prev, transfer: true }));
    }, []);

    const handleReceiveClick = useCallback(() => {
      setTransferSuccessHash(null);
      setModalState((prev) => ({ ...prev, deposit: true }));
    }, []);

    const handleCloseTransfer = useCallback(() => {
      setModalState((prev) => ({ ...prev, transfer: false }));
      setTransferToken(null);
      setTransferSuccessHash(null);
    }, []);

    const handleTransferSuccess = useCallback(
      (txHash: string) => {
        refetchBalance();
        handleCloseTransfer();
        setTransferSuccessHash(txHash);
      },
      [refetchBalance, handleCloseTransfer],
    );

    const handleGoToWallet = useCallback(() => {
      setTransferSuccessHash(null);
      setSelectedNFT(null);
      setSelectedToken(null);
      setModalState({ transfer: false, deposit: false });
    }, []);

    const explorerBaseUrl = useMemo(() => {
      const { explorerUrl } = getNetworkConfig(currentChainId);
      return `${explorerUrl.replace(/\/$/, '')}/tx/`;
    }, [currentChainId]);

    const handleCloseDeposit = useCallback(() => {
      setModalState((prev) => ({ ...prev, deposit: false }));
    }, []);

    const handleRequestAESKey = useCallback(async () => {
      if (!currentAESKey && userHasAESKey) {
        setIsRequestingAESKey(true);
        try {
          await getAESKey();
          if (currentChainId !== null) {
            acknowledgedChainsRef.current[currentChainId] = false;
          }
          setShowAESKeyDisplay(true);
        } catch (error: any) {
          if (error?.code === 4001 || error?.code === -32603) {
            throw error;
          }
        } finally {
          setIsRequestingAESKey(false);
        }
      }
    }, [currentAESKey, userHasAESKey, getAESKey, currentChainId]);

    const handleLaunchDApp = useCallback(() => {
      if (currentChainId !== null) {
        acknowledgedChainsRef.current[currentChainId] = true;
      }
      setShowAESKeyDisplay(false);
    }, [currentChainId]);

    const handleDeleteAESKey = useCallback(() => {
      if (currentChainId !== null) {
        delete acknowledgedChainsRef.current[currentChainId];
      }
      setShowDeleteConfirmation(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
      setShowDeleteConfirmation(false);
    }, []);

    if (shouldShowConnectWallet) {
      return <Loading title="Loading..." actionText="" />;
    }

    if (showDeleteConfirmation) {
      return (
        <MainStack>
          <DeleteAESKey handleShowDelete={handleCancelDelete} />
        </MainStack>
      );
    }

    if (!currentAESKey && userHasAESKey && !showAESKeyDisplay && !aesKey) {
      return (
        <MainStack>
          <RequestAESKey
            onRequestAESKey={handleRequestAESKey}
            isRequesting={isRequestingAESKey}
          />
        </MainStack>
      );
    }

    if (showAESKeyDisplay && (currentAESKey || userAESKey)) {
      return (
        <MainStack>
          <DisplayAESKey
            aesKey={currentAESKey || userAESKey || ''}
            onLaunchDApp={handleLaunchDApp}
            onDeleteAESKey={handleDeleteAESKey}
          />
        </MainStack>
      );
    }

    if (transferSuccessHash) {
      const txLink = `${explorerBaseUrl}${transferSuccessHash}`;
      const shortHash = formatAddressForDisplay(transferSuccessHash, 10, 8);

      return (
        <MainStack>
          <TokenDetailsContainer>
            <HeaderBar>
              <HeaderBarSlotLeft>
                <IconButton
                  onClick={handleGoToWallet}
                  type="button"
                  aria-label="Go back"
                >
                  <ArrowBack />
                </IconButton>
              </HeaderBarSlotLeft>
            </HeaderBar>

            <SuccessCheckCircle>
              <SuccessCheckMark>&#10003;</SuccessCheckMark>
            </SuccessCheckCircle>

            <SuccessTitle>Transaction sent successfully</SuccessTitle>

            <SuccessContent>
              <SuccessDetailRow>
                <SuccessDetailLabel>Transaction Hash</SuccessDetailLabel>
                <AddressBadge>
                  <TokenDetailsLink
                    href={txLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortHash}
                  </TokenDetailsLink>
                  <AddressCopyButton
                    onClick={() => copyToClipboard(transferSuccessHash)}
                  >
                    {copied ? <CopySuccessIcon /> : <CopyIcon />}
                  </AddressCopyButton>
                </AddressBadge>
              </SuccessDetailRow>
            </SuccessContent>

            <ButtonAction text="Back to wallet" onClick={handleGoToWallet} />
          </TokenDetailsContainer>
        </MainStack>
      );
    }

    if (modalState.transfer) {
      return (
        <TransferTokens
          onBack={handleCloseTransfer}
          address={address}
          balance={formattedBalance}
          aesKey={currentAESKey}
          initialToken={transferToken}
          onTransferSuccess={handleTransferSuccess}
        />
      );
    }

    if (selectedNFT) {
      return (
        <NFTDetails
          nft={selectedNFT}
          open={true}
          onClose={() => setSelectedNFT(null)}
          setActiveTab={(tab) => setSelectedNFT(null)}
          setSelectedNFT={setSelectedNFT}
          provider={browserProvider!}
          onSendClick={handleNFTSendClick}
          aesKey={currentAESKey}
        />
      );
    }

    if (selectedToken) {
      return (
        <TokenDetails
          token={selectedToken}
          open={true}
          onClose={() => setSelectedToken(null)}
          setActiveTab={(tab) => setSelectedToken(null)}
          setSelectedToken={setSelectedToken}
          provider={browserProvider!}
          cotiBalance={formattedBalance}
          aesKey={currentAESKey}
          onSendClick={handleTokenSendClick}
        />
      );
    }

    return (
      <ContentWrapper>
        <MainStack>
          <BalanceDisplay balance={formattedBalance} />

          <QuickAccessActions
            onSendClick={handleSendClick}
            onReceiveClick={handleReceiveClick}
          />

          {browserProvider && (
            <Tokens
              balance={formattedBalance}
              provider={browserProvider}
              aesKey={currentAESKey}
              onSelectNFT={setSelectedNFT}
              onSelectToken={setSelectedToken}
            />
          )}
        </MainStack>

        <DepositModal
          isOpen={modalState.deposit}
          onClose={handleCloseDeposit}
          address={address}
        />
      </ContentWrapper>
    );
  },
);

ContentManageToken.displayName = 'ContentManageToken';
