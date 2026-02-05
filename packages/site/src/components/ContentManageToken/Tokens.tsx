import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserProvider } from '@coti-io/coti-ethers';

import { useImportedTokens } from '../../hooks/useImportedTokens';
import { useSnap } from '../../hooks/SnapContext';
import { useDropdown } from '../../hooks/useDropdown';
import { useTokenBalances } from '../../hooks/useTokenBalances';
import { ImportedToken } from '../../types/token';
import { ImportTokenModal } from './ImportTokenModal';
import { ImportNFTModal } from './ImportNFTModal';
import { sortTokens } from '../../utils/tokenHelpers';
import { parseNFTAddress } from '../../utils/tokenValidation';
import {
  FilterIcon,
  MenuIcon,
} from '../../assets/icons';
import {
  HeaderBar,
  HeaderActions, 
  CenteredTabsWrapper, 
  TabsWrapper, 
  Tab, 
  IconButton, 
  TokensLoadingContainer,
  TabContentContainer,
} from './styles';
import {
  TokensTabContent,
  NFTsTabContent,
  SortOptions,
  MenuOptions,
  type SortType
} from './components';
import NFTDetails from './NFTDetails';
import TokenDetails from './TokenDetails';
import { SyncSnapModal } from './SyncSnapModal';
import { useTokenOperations } from '../../hooks/useTokenOperations';

interface TokensProps {
  balance: string;
  provider: BrowserProvider;
  aesKey?: string | null | undefined;
  onSelectNFT?: (nft: ImportedToken) => void;
  onSelectToken?: (token: ImportedToken) => void;
}

type TabType = 'tokens' | 'nfts';

export const Tokens: React.FC<TokensProps> = React.memo(({ balance, provider, aesKey, onSelectNFT, onSelectToken }) => {
  const [activeTab, setActiveTab] = useState<TabType>('tokens');
  const [sort, setSort] = useState<SortType>('decline');
  const [showImportTokenModal, setShowImportTokenModal] = useState(false);
  const [showImportNFTModal, setShowImportNFTModal] = useState(false);
  const [showSyncSnapModal, setShowSyncSnapModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<ImportedToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<ImportedToken | null>(null);
  const { userAESKey, userHasAESKey, getAESKey } = useSnap();
  const [isDecrypted, setIsDecrypted] = useState(!!userAESKey || !!aesKey);
  const [nftImageMap, setNftImageMap] = useState<Record<string, string>>({});
  
  const { importedTokens, isLoading, refreshTokens, removeToken } = useImportedTokens();
  const menuDropdown = useDropdown();
  const sortDropdown = useDropdown();
  const effectiveAESKey = aesKey || userAESKey;

  useEffect(() => {
    setIsDecrypted(!!effectiveAESKey);
  }, [effectiveAESKey]);

  const { regularTokens, nftTokens } = useMemo(() => {
      const cotiToken: ImportedToken = {
        address: '',
        name: 'COTI',
        symbol: 'COTI',
        decimals: 18,
        type: 'ERC20'
      };
    
    const regular = [cotiToken, ...importedTokens.filter(t => !((t.type === 'ERC721' || t.type === 'ERC1155') && t.address.includes('-')))];
    const nfts = importedTokens.filter(t => (t.type === 'ERC721' || t.type === 'ERC1155') && t.address.includes('-'));
    
    return {
      regularTokens: regular,
      nftTokens: nfts
    };
  }, [importedTokens]);

  const { balances } = useTokenBalances({
    tokens: regularTokens,
    provider,
    aesKey: effectiveAESKey,
    cotiBalance: balance
  });

  const sortedTokens = useMemo(() => 
    sortTokens(regularTokens, sort, balances), 
    [regularTokens, sort, balances]
  );

  const sortedNFTs = useMemo(() => 
    sortTokens(nftTokens, sort), 
    [nftTokens, sort]
  );

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleSortChange = useCallback((newSort: SortType) => {
    setSort(newSort);
    sortDropdown.close();
  }, [sortDropdown]);


  const handleImportTokensClick = useCallback(() => {
    setShowImportTokenModal(true);
    menuDropdown.close();
  }, [menuDropdown]);

  const handleOpenImportNFTModal = useCallback(() => {
    setShowImportNFTModal(true);
  }, []);

  const handleCloseImportTokenModal = useCallback(() => {
    setShowImportTokenModal(false);
  }, []);

  const handleTokenImport = useCallback((_importedToken: ImportedToken) => {
    refreshTokens();
  }, [refreshTokens]);

  const handleCloseImportNFTModal = useCallback(() => {
    setShowImportNFTModal(false);
  }, []);

  const refreshTokensList = useCallback(() => {
    refreshTokens();
  }, [refreshTokens]);

  const handleRefreshTokens = useCallback(() => {
    refreshTokensList();
    menuDropdown.close();
  }, [refreshTokensList, menuDropdown]);

  const handleSyncToSnap = useCallback(() => {
    setShowSyncSnapModal(true);
    menuDropdown.close();
  }, [menuDropdown]);

  const handleToggleDecryption = useCallback(() => {
    setIsDecrypted(prev => !prev);
  }, []);

  const headerActionsStyle = useMemo(() => ({ position: 'relative' as const, marginTop: '4px' }), []);
  const { getERC1155Balance, getERC721Owner, getNFTMetadata } = useTokenOperations(provider);

  useEffect(() => {
    setNftImageMap(prev => {
      const currentAddresses = new Set(nftTokens.map(nft => nft.address));
      let hasChanges = false;
      const nextEntries: Record<string, string> = {};

      for (const [address, url] of Object.entries(prev)) {
        if (currentAddresses.has(address)) {
          nextEntries[address] = url;
        } else {
          hasChanges = true;
        }
      }

      return hasChanges ? nextEntries : prev;
    });
  }, [nftTokens]);

  useEffect(() => {
    if (!provider || nftTokens.length === 0) return;

    let cancelled = false;

    const verifyOwnership = async () => {
      try {
        const signer = await provider.getSigner();
        const userAddress = (await signer.getAddress()).toLowerCase();

        for (const nft of nftTokens) {
          if (!nft.address || !nft.type) continue;

          const { contractAddress, tokenId } = parseNFTAddress(nft.address);
          if (!contractAddress || !tokenId) continue;

          try {
            if (nft.type === 'ERC1155') {
              const balance = await getERC1155Balance(contractAddress, userAddress, tokenId);
              if (!cancelled && BigInt(balance || '0') === 0n) {
                removeToken(nft.address);
              }
            } else {
              const owner = await getERC721Owner(contractAddress, tokenId);
              if (!cancelled && owner && owner.toLowerCase() !== userAddress) {
                removeToken(nft.address);
              }
            }
          } catch (error) {
            if (!cancelled) {
              void error;
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          void error;
        }
      }
    };

    void verifyOwnership();

    return () => {
      cancelled = true;
    };
  }, [provider, nftTokens, getERC1155Balance, getERC721Owner, removeToken]);

  useEffect(() => {
    if (!provider || nftTokens.length === 0) return;

    const missingNFTs = nftTokens.filter(nft => nft.address && !nftImageMap[nft.address]);
    if (missingNFTs.length === 0) return;

    let cancelled = false;

    const loadImages = async () => {
      for (const nft of missingNFTs) {
        if (!nft.address || !nft.type) continue;
        const { contractAddress, tokenId } = parseNFTAddress(nft.address);
        if (!contractAddress || !tokenId) continue;

        try {
          const metadata = await getNFTMetadata({
            tokenAddress: contractAddress,
            tokenId,
            tokenType: nft.type,
            ...(effectiveAESKey && { aesKey: effectiveAESKey })
          });

          console.log(`[Tokens] NFT ${nft.address} - Metadata:`, metadata);

          const image = metadata?.image;
          console.log(`[Tokens] NFT ${nft.address} - Image URL:`, image);

          if (!cancelled && image) {
            setNftImageMap(prev => {
              const newMap = {
                ...prev,
                [nft.address]: image
              };
              console.log(`[Tokens] Updated nftImageMap:`, newMap);
              return newMap;
            });
          }
        } catch (error) {
          if (!cancelled) {
            console.error(`[Tokens] Error loading NFT ${nft.address}:`, error);
            void error;
          }
        }
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [provider, nftTokens, getNFTMetadata, nftImageMap, effectiveAESKey]);

  return (
    <>
      <CenteredTabsWrapper>
        <TabsWrapper>
          <Tab
            active={activeTab === 'tokens'}
            onClick={() => handleTabChange('tokens')}
            type="button"
          >
            Tokens
          </Tab>
          <Tab
            active={activeTab === 'nfts'}
            onClick={() => handleTabChange('nfts')}
            type="button"
          >
            NFTs
          </Tab>
        </TabsWrapper>

        <HeaderBar>
          <div />
          <HeaderActions style={headerActionsStyle}>
            <IconButton 
              onClick={sortDropdown.toggle} 
              selected={sortDropdown.isOpen}
              type="button"
              aria-label="Sort options"
            >
              <FilterIcon />
            </IconButton>
            <IconButton 
              onClick={menuDropdown.toggle} 
              selected={menuDropdown.isOpen}
              type="button"
              aria-label="Menu options"
            >
              <MenuIcon />
            </IconButton>
            
            {(menuDropdown.isOpen && (activeTab === 'tokens' || activeTab === 'nfts')) && (
              <MenuOptions
                onImportTokens={activeTab === 'tokens' ? handleImportTokensClick : handleOpenImportNFTModal}
                onRefreshTokens={handleRefreshTokens}
                onSyncToSnap={handleSyncToSnap}
                dropdownRef={menuDropdown.ref}
                importLabel={activeTab === 'tokens' ? 'Import tokens' : 'Import NFT'}
              />
            )}
            
            {sortDropdown.isOpen && (
              <SortOptions
                sort={sort}
                onSortChange={handleSortChange}
                dropdownRef={sortDropdown.ref}
              />
            )}
          </HeaderActions>
        </HeaderBar>

        <TabContentContainer>
          {activeTab === 'tokens' ? (
            isLoading ? (
              <TokensLoadingContainer>
                Loading tokens...
              </TokensLoadingContainer>
            ) : (
              <TokensTabContent 
                tokens={sortedTokens}
                userHasAESKey={userHasAESKey}
                userAESKey={userAESKey}
                getAESKey={getAESKey}
                provider={provider}
                cotiBalance={balance}
                propAESKey={aesKey}
                onSelectToken={onSelectToken || setSelectedToken}
                isDecrypted={isDecrypted}
                onToggleDecryption={handleToggleDecryption}
                balances={balances}
              />
            )
          ) : (
            <NFTsTabContent 
              nfts={sortedNFTs}
              onOpenImportNFTModal={handleOpenImportNFTModal} 
              onRefreshNFTs={refreshTokens}
              onSelectNFT={onSelectNFT || setSelectedNFT}
              nftImages={nftImageMap}
            />
          )}
        </TabContentContainer>
      </CenteredTabsWrapper>

      <ImportTokenModal 
        open={showImportTokenModal} 
        onClose={handleCloseImportTokenModal} 
        provider={provider}
        onImport={handleTokenImport}
      />
      <ImportNFTModal
        open={showImportNFTModal}
        onClose={handleCloseImportNFTModal}
        provider={provider}
        onImport={refreshTokens}
      />
      <SyncSnapModal
        open={showSyncSnapModal}
        onClose={() => setShowSyncSnapModal(false)}
      />
      {!onSelectNFT && (
        <NFTDetails
          nft={selectedNFT}
          open={!!selectedNFT}
          onClose={() => {
            setActiveTab('nfts');
            setSelectedNFT(null);
          }}
          setActiveTab={setActiveTab}
          setSelectedNFT={setSelectedNFT}
          provider={provider}
          imageUrl={selectedNFT ? nftImageMap[selectedNFT.address] : undefined}
          aesKey={effectiveAESKey}
        />
      )}
      {!onSelectToken && (
        <TokenDetails 
          token={selectedToken} 
          open={!!selectedToken} 
          onClose={() => {
            setActiveTab('tokens');
            setSelectedToken(null);
          }}
          setActiveTab={setActiveTab}
          setSelectedToken={setSelectedToken}
          provider={provider}
          cotiBalance={balance}
          aesKey={aesKey}
        />
      )}
    </>
  );
});

Tokens.displayName = 'Tokens';
