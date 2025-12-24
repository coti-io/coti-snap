import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ImportedToken } from '../../../types/token';
import { NFTCard, NFTCardImage, NFTCornerIcon } from '../styles';
import DefaultNFTImage from '../../../assets/images/default_nft.png';

interface NFTCardProps {
  nft: ImportedToken;
  imageUrl?: string | undefined;
  onClick?: () => void;
}

// Alternative IPFS gateways for fallback
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
];

// Extract CID from IPFS gateway URL (supports both path and subdomain formats)
const extractCIDFromUrl = (url: string): string | null => {
  try {
    // Path-based format: https://ipfs.io/ipfs/Qm...
    const pathMatch = url.match(/\/ipfs\/([^/?#]+)/);
    if (pathMatch) return pathMatch[1];

    // Subdomain format: https://Qm....ipfs.dweb.link/
    const subdomainMatch = url.match(/^https?:\/\/([a-z0-9]+)\.ipfs\./i);
    if (subdomainMatch) return subdomainMatch[1];

    return null;
  } catch {
    return null;
  }
};

export const NFTCardComponent: React.FC<NFTCardProps> = React.memo(({ nft, imageUrl, onClick }) => {
  const [imageSrc, setImageSrc] = useState<string>(imageUrl || DefaultNFTImage);
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const originalUrlRef = useRef<string | undefined>(imageUrl);

  useEffect(() => {
    originalUrlRef.current = imageUrl;
    setImageSrc(imageUrl && imageUrl.trim() !== '' ? imageUrl : DefaultNFTImage);
    setFallbackIndex(0);
  }, [imageUrl]);

  const handleImageError = useCallback(() => {
    if (imageSrc === DefaultNFTImage) return;

    const originalUrl = originalUrlRef.current;
    if (!originalUrl) {
      setImageSrc(DefaultNFTImage);
      return;
    }

    // Try to extract CID and use alternative gateways
    const cid = extractCIDFromUrl(originalUrl);
    if (!cid) {
      setImageSrc(DefaultNFTImage);
      return;
    }

    // Generate all possible gateway URLs (both path and subdomain formats)
    const allGateways = [
      ...IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`),
      `https://${cid}.ipfs.dweb.link/`,
      `https://${cid}.ipfs.cf-ipfs.com/`,
    ];

    if (fallbackIndex < allGateways.length) {
      const nextUrl = allGateways[fallbackIndex];
      setImageSrc(nextUrl);
      setFallbackIndex(prev => prev + 1);
    } else {
      // No more fallbacks, use default image
      setImageSrc(DefaultNFTImage);
    }
  }, [imageSrc, fallbackIndex]);

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
