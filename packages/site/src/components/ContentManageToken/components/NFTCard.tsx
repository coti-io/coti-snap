import React, { useEffect, useState } from 'react';
import { ImportedToken } from '../../../types/token';
import { NFTCard, NFTCardImage, NFTCornerIcon } from '../styles';
import DefaultNFTImage from '../../../assets/images/default_nft.png';

interface NFTCardProps {
  nft: ImportedToken;
  imageUrl?: string | undefined;
  onClick?: () => void;
}

export const NFTCardComponent: React.FC<NFTCardProps> = React.memo(({ nft, imageUrl, onClick }) => {
  const [imageSrc, setImageSrc] = useState<string>(imageUrl || DefaultNFTImage);

  useEffect(() => {
    setImageSrc(imageUrl && imageUrl.trim() !== '' ? imageUrl : DefaultNFTImage);
  }, [imageUrl]);

  const handleImageError = () => {
    if (imageSrc !== DefaultNFTImage) {
      setImageSrc(DefaultNFTImage);
    }
  };

  return (
    <NFTCard onClick={onClick} style={{ cursor: 'pointer' }}>
      <NFTCardImage
        src={imageSrc}
        alt="NFT"
        onError={handleImageError}
        loading="lazy"
      />
      <NFTCornerIcon>C</NFTCornerIcon>
    </NFTCard>
  );
});

NFTCardComponent.displayName = 'NFTCardComponent';
