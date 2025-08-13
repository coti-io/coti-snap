import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ImportedToken } from '../../../types/token';
import { ContentBorderWrapper, ContentContainer } from '../../styles';
import { NFTCardComponent } from './NFTCard';
import { NFTGrid } from '../styles';

const NoNFTsMessage = styled.div`
  grid-column: 1/-1;
  text-align: center;
  padding: 24px 0;
  color: #000000 !important;
`;

interface NFTsTabContentProps {
  nfts: ImportedToken[];
  onOpenImportNFTModal: () => void;
  onRefreshNFTs: () => void;
  onSelectNFT: (nft: ImportedToken) => void;
}

export const NFTsTabContent: React.FC<NFTsTabContentProps> = React.memo(({ 
  nfts, 
  onSelectNFT 
}) => {

  const containerStyle = useMemo(() => ({
    boxShadow: 'none',
    padding: '0',
    background: 'none',
    width: '100%',
    maxWidth: '100%'
  }), []);

  return (
    <ContentBorderWrapper>
      <ContentContainer style={containerStyle}>
        <NFTGrid>
          {nfts.length === 0 ? (
            <NoNFTsMessage>
              No NFTs imported.
            </NoNFTsMessage>
          ) : (
            nfts.map((nft) => (
              <NFTCardComponent key={nft.address} nft={nft} onClick={() => onSelectNFT(nft)} />
            ))
          )}
        </NFTGrid>
      </ContentContainer>
    </ContentBorderWrapper>
  );
});

NFTsTabContent.displayName = 'NFTsTabContent';