import React from 'react';
import { ImportedToken } from '../../../types/token';
import { NFTCard, NFTCardImage, NFTCornerIcon } from '../styles';
import DefaultNFTImage from '../../../assets/images/default_nft.png';

interface NFTCardProps {
  nft: ImportedToken;
  onClick?: () => void;
}

export const NFTCardComponent: React.FC<NFTCardProps> = React.memo(({ nft, onClick }) => {
  return (
    <NFTCard onClick={onClick} style={{ cursor: 'pointer' }}>
      <NFTCardImage
        src={DefaultNFTImage}
        alt="NFT"
      />
      <NFTCornerIcon>C</NFTCornerIcon>
    </NFTCard>
  );
});

NFTCardComponent.displayName = 'NFTCardComponent';