import { useState, useMemo, useCallback, memo, useEffect } from 'react';
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
import SendIcon from '../../assets/send.svg';
import ReceiveIcon from '../../assets/receive.svg';
import { useMetaMaskContext } from '../../hooks/MetamaskContext';
import { useSnap } from '../../hooks/SnapContext';
import { truncateString } from '../../utils';
import { Loading } from '../Loading';
import { DeleteAESKey } from '../ContentManageAESKey/DeleteAESKey';
import { ContentWrapper } from './ContentWrapper';

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

interface ContentManageTokenProps {
  aesKey?: string | null;
}

export const ContentManageToken: React.FC<ContentManageTokenProps> = memo(({ aesKey }) => {
  const { address } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance({ address });
  const { provider } = useMetaMaskContext();
  const { getAESKey, userAESKey, userHasAESKey } = useSnap();
  
  const currentAESKey = userAESKey || aesKey;
  const [isRequestingAESKey, setIsRequestingAESKey] = useState(false);
  const [showAESKeyDisplay, setShowAESKeyDisplay] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [modalState, setModalState] = useState<ModalState>({
    transfer: false,
    deposit: false
  });

  const [selectedNFT, setSelectedNFT] = useState<ImportedToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<ImportedToken | null>(null);
  const [transferToken, setTransferToken] = useState<ImportedToken | null>(null);

  useEffect(() => {
    setIsRequestingAESKey(false);
    setShowAESKeyDisplay(false);
    setShowDeleteConfirmation(false);
    setModalState({ transfer: false, deposit: false });
    setSelectedNFT(null);
    setSelectedToken(null);
    setTransferToken(null);
  }, [address]);

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
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleTokenSendClick = useCallback((token: ImportedToken) => {
    setTransferToken(token);
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleNFTSendClick = useCallback((nft: ImportedToken) => {
    setTransferToken(nft);
    setModalState(prev => ({ ...prev, transfer: true }));
  }, []);

  const handleReceiveClick = useCallback(() => {
    setModalState(prev => ({ ...prev, deposit: true }));
  }, []);

  const handleCloseTransfer = useCallback(() => {
    setModalState(prev => ({ ...prev, transfer: false }));
    setTransferToken(null);
  }, []);

  const handleTransferSuccess = useCallback(() => {
    refetchBalance();
    handleCloseTransfer();
  }, [refetchBalance, handleCloseTransfer]);

  const handleCloseDeposit = useCallback(() => {
    setModalState(prev => ({ ...prev, deposit: false }));
  }, []);

  const handleRequestAESKey = useCallback(async () => {
    if (!currentAESKey && userHasAESKey) {
      setIsRequestingAESKey(true);
      try {
        await getAESKey();
        setShowAESKeyDisplay(true);
      } catch (error: any) {
        if (error?.code === 4001 || error?.code === -32603) {
          throw error;
        }
      } finally {
        setIsRequestingAESKey(false);
      }
    }
  }, [currentAESKey, userHasAESKey, getAESKey]);

  const handleLaunchDApp = useCallback(() => {
    setShowAESKeyDisplay(false);
  }, []);

  const handleDeleteAESKey = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);


  if (shouldShowConnectWallet) {
    return <Loading title="Loading..." actionText="" />;
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

  if (showDeleteConfirmation) {
    return (
      <MainStack>
        <DeleteAESKey handleShowDelete={handleCancelDelete} />
      </MainStack>
    );
  }

  if (showAESKeyDisplay && currentAESKey) {
    return (
      <MainStack>
        <DisplayAESKey 
          aesKey={currentAESKey}
          onLaunchDApp={handleLaunchDApp}
          onDeleteAESKey={handleDeleteAESKey}
        />
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