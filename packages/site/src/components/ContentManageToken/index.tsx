import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'ethers';
import { BrowserProvider } from '@coti-io/coti-ethers';
import styled, { keyframes } from 'styled-components';
import './transitions.css';
import { QuickAccessButton, QuickAccessGroup, QuickAccessItem, QuickAccessLabel, MainStack } from './styles';
import { BalanceDisplay } from './components/BalanceDisplay';
import { RequestAESKey } from './RequestAESKey';
import { DisplayAESKey } from './DisplayAESKey';
import { Tokens } from './Tokens';
import NFTDetails from './NFTDetails';
import TokenDetails from './TokenDetails';
import { ImportedToken } from '../../types/token';
import { TransferTokens } from './TransferTokens';
import { DepositTokens } from './DepositTokens';
import { ButtonAction } from '../Button';
import SendIcon from '../../assets/send.svg';
import ReceiveIcon from '../../assets/receive.svg';
import { useMetaMaskContext } from '../../hooks/MetamaskContext';
import { useSnap } from '../../hooks/SnapContext';
import { truncateString } from '../../utils';
import { Loading } from '../Loading';
import { DeleteAESKey } from '../ContentManageAESKey/DeleteAESKey';
import { ContentWrapper } from './ContentWrapper';
import { getNetworkConfig } from '../../config/networks';

interface ModalState {
  transfer: boolean;
  deposit: boolean;
}

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

const QuickAccessActions = memo(({ onSendClick, onReceiveClick }: {
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
));

QuickAccessActions.displayName = 'QuickAccessActions';

const DepositModal = memo(({ isOpen, onClose, address }: {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <AnimatedModalWrapper>
        <DepositTokens onClose={onClose} address={address} />
      </AnimatedModalWrapper>
    </ModalBackdrop>
  );
});

DepositModal.displayName = 'DepositModal';

const SuccessWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 320px;
`;

const SuccessCard = styled.div`
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 28px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  text-align: center;
`;

const SuccessText = styled.p`
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.45;
  color: #000000 !important;
  font-weight: 600;
`;

const SuccessHashRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const SuccessHashLabel = styled.span`
  font-size: 1.4rem;
  color: #000000 !important;
  font-weight: 600;
`;

const SuccessHashLink = styled.a`
  display: inline-block;
  margin-top: 0;
  font-size: 1.5rem;
  color: #1E29F6 !important;
  word-break: break-all;
  text-decoration: underline;
`;

const SuccessActions = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
`;

interface ContentManageTokenProps {
  aesKey?: string | null;
}

export const ContentManageToken: React.FC<ContentManageTokenProps> = memo(({ aesKey }) => {
  const { address, chain } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const { provider } = useMetaMaskContext();
  const { getAESKey, userAESKey, userHasAESKey } = useSnap();
  
  const currentAESKey = userAESKey || aesKey;
  const [isRequestingAESKey, setIsRequestingAESKey] = useState(false);
  const [showAESKeyDisplay, setShowAESKeyDisplay] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transferSuccessHash, setTransferSuccessHash] = useState<string | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    transfer: false,
    deposit: false
  });

  const [selectedNFT, setSelectedNFT] = useState<ImportedToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<ImportedToken | null>(null);
  const [transferToken, setTransferToken] = useState<ImportedToken | null>(null);

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
    if (
      previousChainIdRef.current === null &&
      currentChainId !== null
    ) {
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
    if (!balance) return '0';
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
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleTokenSendClick = useCallback((token: ImportedToken) => {
    setTransferSuccessHash(null);
    setTransferToken(token);
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleNFTSendClick = useCallback((nft: ImportedToken) => {
    setTransferSuccessHash(null);
    setTransferToken(nft);
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleReceiveClick = useCallback(() => {
    setTransferSuccessHash(null);
    setModalState(prev => ({ ...prev, deposit: true }));
  }, []);

  const handleCloseTransfer = useCallback(() => {
    setModalState(prev => ({ ...prev, transfer: false }));
    setTransferToken(null);
    setTransferSuccessHash(null);
  }, []);

  const handleTransferSuccess = useCallback((txHash: string) => {
    refetchBalance();
    handleCloseTransfer();
    setTransferSuccessHash(txHash);
  }, [refetchBalance, handleCloseTransfer]);

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
    setModalState(prev => ({ ...prev, deposit: false }));
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

    return (
      <MainStack>
        <SuccessWrapper>
          <SuccessCard>
            <SuccessText>Transaction sent successfully</SuccessText>
            <SuccessHashRow>
              <SuccessHashLabel>Transaction Hash:</SuccessHashLabel>
              <SuccessHashLink
                href={txLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {transferSuccessHash}
              </SuccessHashLink>
            </SuccessHashRow>
            <SuccessActions>
              <ButtonAction text="Wallet" onClick={handleGoToWallet} />
            </SuccessActions>
          </SuccessCard>
        </SuccessWrapper>
      </MainStack>
    );
  }

  if (modalState.transfer) {
    return (
      <TransferTokens 
        onBack={handleCloseTransfer} 
        address={truncateString(address!)} 
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
        <BalanceDisplay
          balance={formattedBalance} 
        />
        
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
        address={address!}
      />
    </ContentWrapper>
  );
});

ContentManageToken.displayName = 'ContentManageToken';
