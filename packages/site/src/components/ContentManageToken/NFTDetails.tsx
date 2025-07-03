import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';
import { ImportedToken } from '../../types/token';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useDropdown } from '../../hooks/useDropdown';
import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useTokenOperations } from '../../hooks/useTokenOperations';
import { parseNFTAddress, formatAddressForDisplay } from '../../utils/tokenValidation';
import { 
  NFTCard, 
  NFTCardImage, 
  NFTCornerIcon,
  NFTDetailsContainer,
  NFTDetailsImageContainer,
  NFTDetailsContent,
  NFTDetailsRow,
  NFTDetailsLabel,
  NFTDetailsValue,
  NFTDetailsDisclaimer,
  SendButton,
  AddressBadge,
  AddressCopyButton,
  TokenDetailsLink,
  IconButton,
  MenuDropdown,
  MenuItem,
} from './styles';
import DefaultNFTImage from '../../assets/images/default_nft.png';
import ArrowBack from '../../assets/arrow-back.svg';
import CopyIcon from '../../assets/copy.svg';
import CopySuccessIcon from '../../assets/copy-success.svg';
import VerticalMenuIcon from '../../assets/icons/vertical-menu.svg';
import TrashIcon from '../../assets/icons/trash.svg';
import { HeaderBar } from './styles';
import { HeaderBarSlotLeft, HeaderBarSlotRight } from './styles/transfer';

interface NFTDetailModalProps {
  nft: ImportedToken | null;
  open: boolean;
  onClose: () => void;
  setActiveTab: React.Dispatch<React.SetStateAction<'tokens' | 'nfts'>>;
  setSelectedNFT: React.Dispatch<React.SetStateAction<ImportedToken | null>>;
  provider?: BrowserProvider;
  onNFTRemoved?: () => void;
  onSendClick?: (nft: ImportedToken) => void;
}

const NFTDetails: React.FC<NFTDetailModalProps> = ({ nft, open, onClose, setActiveTab, setSelectedNFT, provider, onNFTRemoved, onSendClick }) => {
  const { copyToClipboard, copied } = useCopyToClipboard();
  const { removeToken } = useImportedTokens();
  const menuDropdown = useDropdown();
  const [erc1155Balance, setErc1155Balance] = useState<string>('1');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const balanceCache = useRef<Map<string, string>>(new Map());
  const fetchingRef = useRef<Set<string>>(new Set());

  const tokenOps = provider ? useTokenOperations(provider) : null;

  if (!open || !nft) return null;

  const { contractAddress: contract, tokenId } = useMemo(() => parseNFTAddress(nft.address), [nft.address]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (nft?.type === 'ERC1155' && contract && tokenId && tokenOps && provider) {
        const cacheKey = `${contract}-${tokenId}`;
        if (balanceCache.current.has(cacheKey)) {
          setErc1155Balance(balanceCache.current.get(cacheKey)!);
          return;
        }
        if (fetchingRef.current.has(cacheKey)) {
          return;
        }
        fetchingRef.current.add(cacheKey);
        setIsLoadingBalance(true);
        try {
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          const balance = await tokenOps.getERC1155Balance(contract, userAddress, tokenId);
          balanceCache.current.set(cacheKey, balance);
          setErc1155Balance(balance);
        } catch (error) {
          setErc1155Balance('0');
        } finally {
          setIsLoadingBalance(false);
          fetchingRef.current.delete(cacheKey);
        }
      }
    };

    fetchBalance();
  }, [nft?.type, contract, tokenId, tokenOps, provider]);
  
  const shortAddress = contract ? formatAddressForDisplay(contract) : '';

  const handleCopy = useCallback((text: string) => {
    copyToClipboard(text);
  }, [copyToClipboard]);

  const handleRemoveToken = useCallback(() => {
    if (nft) {
      removeToken(nft.address);
      onClose();
      onNFTRemoved?.();
    }
    menuDropdown.close();
  }, [nft, removeToken, onClose, onNFTRemoved, menuDropdown]);


  return (
    <NFTDetailsContainer>
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
          
          {menuDropdown.isOpen && nft?.symbol !== 'COTI' && (
            <MenuDropdown ref={menuDropdown.ref}>
              <MenuItem onClick={handleRemoveToken} type="button">
                <TrashIcon />
                Hide {nft.symbol}
              </MenuItem>
            </MenuDropdown>
          )}
        </HeaderBarSlotRight>
      </HeaderBar>
      <NFTDetailsImageContainer>
        <NFTCard style={{ width: 140, height: 140, borderRadius: 16 }}>
          <NFTCardImage src={DefaultNFTImage} alt="NFT" />
          <NFTCornerIcon>C</NFTCornerIcon>
        </NFTCard>
      </NFTDetailsImageContainer>
      <NFTDetailsContent>
        <NFTDetailsRow>
          <NFTDetailsLabel>Contract address</NFTDetailsLabel>
          <AddressBadge onClick={() => handleCopy(contract)}>
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
        </NFTDetailsRow>
        <NFTDetailsRow>
          <NFTDetailsLabel>Token ID</NFTDetailsLabel>
          <NFTDetailsValue>{tokenId}</NFTDetailsValue>
        </NFTDetailsRow>
        {nft.type === 'ERC1155' && (
          <NFTDetailsRow>
            <NFTDetailsLabel>Balance</NFTDetailsLabel>
            <NFTDetailsValue>
              {isLoadingBalance ? '...' : `${erc1155Balance}`}
            </NFTDetailsValue>
          </NFTDetailsRow>
        )}
        <NFTDetailsRow>
          <NFTDetailsLabel>Token Standard</NFTDetailsLabel>
          <NFTDetailsValue>{nft.type || 'ERC721'}</NFTDetailsValue>
        </NFTDetailsRow>
        <NFTDetailsDisclaimer>
          Disclaimer: MetaMask pulls the media file from the source url. This url sometimes gets changed by the marketplace on which the NFT was minted.
        </NFTDetailsDisclaimer>
        <SendButton onClick={() => nft && onSendClick && onSendClick(nft)}>
          Send
        </SendButton>
      </NFTDetailsContent>
    </NFTDetailsContainer>
  );
};

export default NFTDetails;