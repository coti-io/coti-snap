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
import {
  DownArrow,
  FilterIcon,
  MenuIcon,
} from '../../assets/icons';
import { 
  HeaderBar, 
  NetworkBadge, 
  HeaderActions, 
  CenteredTabsWrapper, 
  TabsWrapper, 
  Tab, 
  IconButton, 
  TokensLoadingContainer,
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
  const [selectedNFT, setSelectedNFT] = useState<ImportedToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<ImportedToken | null>(null);
  const { userAESKey, userHasAESKey, getAESKey } = useSnap();
  const [isDecrypted, setIsDecrypted] = useState(!!userAESKey || !!aesKey);
  
  const { importedTokens, isLoading, refreshTokens } = useImportedTokens();
  const menuDropdown = useDropdown();
  const sortDropdown = useDropdown();

  const effectiveAESKey = aesKey || userAESKey;

  useEffect(() => {
    setIsDecrypted(!!effectiveAESKey);
  }, [effectiveAESKey, userAESKey, aesKey, isDecrypted]);

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

  const handleToggleDecryption = useCallback(() => {
    setIsDecrypted(prev => !prev);
  }, []);

  const headerActionsStyle = useMemo(() => ({ position: 'relative' as const }), []);

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
          <NetworkBadge>
            COTI TESTNET <DownArrow />
          </NetworkBadge>
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
          />
        )}
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