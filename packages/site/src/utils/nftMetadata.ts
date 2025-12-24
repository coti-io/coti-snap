const IPFS_PREFIX = 'ipfs://';
const IPFS_IPFS_PREFIX = 'ipfs://ipfs/';
const ARWEAVE_PREFIX = 'ar://';
const ARWEAVE_GATEWAY = 'https://arweave.net/';

const ensureTrailingSlash = (value: string): string => {
  if (!value.endsWith('/')) {
    return `${value}/`;
  }
  return value;
};

const resolveDefaultGateway = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_IPFS_GATEWAY) {
    return ensureTrailingSlash(process.env.NEXT_PUBLIC_IPFS_GATEWAY);
  }
  // Use Cloudflare IPFS gateway as default (better CORS support)
  return 'https://cloudflare-ipfs.com/ipfs/';
};

// Multiple public IPFS gateways to try as fallbacks
// Ordered by reliability and CORS support
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
];

const IPFS_GATEWAY = resolveDefaultGateway();

const isFallbackEnabled = (): boolean => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENABLE_IPFS_FALLBACK === 'false') {
    return false;
  }
  return true;
};

const IPFS_FALLBACK_ENABLED = isFallbackEnabled();

const toHexTokenId = (tokenId?: string): string | null => {
  if (!tokenId) return null;
  const trimmed = tokenId.trim();
  if (trimmed.length === 0) return null;

  try {
    if (trimmed.startsWith('0x')) {
      const hex = trimmed.slice(2);
      if (!hex) return null;
      return hex.padStart(64, '0');
    }

    const numeric = BigInt(trimmed);
    return numeric.toString(16).padStart(64, '0');
  } catch (error) {
    void error;
    return trimmed;
  }
};

export const resolveTokenUri = (uri?: string | null, tokenId?: string): string | null => {
  if (!uri) return null;
  let resolved = uri.trim();
  if (!resolved) return null;

  const hexTokenId = toHexTokenId(tokenId);
  if (hexTokenId) {
    resolved = resolved.replace(/{id}/gi, hexTokenId);
  }

  if (resolved.startsWith(IPFS_IPFS_PREFIX)) {
    return `${IPFS_GATEWAY}${resolved.slice(IPFS_IPFS_PREFIX.length)}`;
  }

  if (resolved.startsWith(IPFS_PREFIX)) {
    return `${IPFS_GATEWAY}${resolved.slice(IPFS_PREFIX.length)}`;
  }

  if (resolved.startsWith(ARWEAVE_PREFIX)) {
    return `${ARWEAVE_GATEWAY}${resolved.slice(ARWEAVE_PREFIX.length)}`;
  }

  return resolved;
};

export interface ImageUriResolution {
  resolved: string | null;
  original: string | null;
  fallbacks: string[];
}

const toGatewayFromHttpIpfsPath = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      return null;
    }
    const pathname = parsed.pathname || '';
    const ipfsIndex = pathname.indexOf('/ipfs/');
    if (ipfsIndex === -1) {
      return null;
    }
    const cidPath = pathname.substring(ipfsIndex + 6);
    if (!cidPath) {
      return null;
    }
    return `${IPFS_GATEWAY}${cidPath}${parsed.search || ''}${parsed.hash || ''}`;
  } catch (error) {
    void error;
    return null;
  }
};

export const extractImageUri = (metadata: Record<string, any> | null | undefined, tokenId?: string): ImageUriResolution => {
  if (!metadata) return { resolved: null, original: null, fallbacks: [] };
  const potentialKeys = ['image', 'image_url', 'imageUrl', 'animation_url', 'animationUrl'];

  for (const key of potentialKeys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim()) {
      const original = value.trim();
      const resolved = resolveTokenUri(original, tokenId) ?? original;
      const fallbacks: string[] = [];

      if (IPFS_FALLBACK_ENABLED) {
        const gatewayFromHttp = toGatewayFromHttpIpfsPath(original);
        if (gatewayFromHttp && gatewayFromHttp !== resolved) {
          fallbacks.push(gatewayFromHttp);
        }
      }

      if (resolved !== original) {
        fallbacks.push(resolved);
      }

      // Add subdomain format for IPFS URLs
      if (original.startsWith('ipfs://')) {
        const cid = original.slice(7);
        const subdomainUrl = `https://${cid}.ipfs.dweb.link/`;
        if (!fallbacks.includes(subdomainUrl)) {
          fallbacks.push(subdomainUrl);
        }
      }

      return { resolved, original, fallbacks };
    }
  }

  return { resolved: null, original: null, fallbacks: [] };
};

export const parseDataUriJson = (uri: string): Record<string, any> | null => {
  const DATA_PREFIX = 'data:application/json';
  if (!uri.startsWith(DATA_PREFIX)) return null;

  const commaIndex = uri.indexOf(',');
  if (commaIndex === -1) return null;

  const meta = uri.slice(0, commaIndex);
  const data = uri.slice(commaIndex + 1);

  try {
    if (meta.includes(';base64')) {
      const decoder = typeof window !== 'undefined' && window.atob ? window.atob.bind(window) : null;
      if (!decoder) return null;
      const decoded = decoder(data);
      return JSON.parse(decoded);
    }
    return JSON.parse(decodeURIComponent(data));
  } catch (error) {
    void error;
    return null;
  }
};

// Extract CID from IPFS HTTP gateway URL (supports both path and subdomain formats)
const extractCIDFromGatewayUrl = (url: string): string | null => {
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

export const fetchImageAsDataUri = async (url: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !url) return null;

  // Resolve IPFS URLs to HTTP gateways
  let urlsToTry: string[] = [];

  if (url.startsWith('ipfs://')) {
    const cid = url.slice(7); // Remove 'ipfs://'
    // Try multiple gateways for IPFS URLs (both path and subdomain formats)
    urlsToTry = [
      ...IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`),
      // Add subdomain format URLs
      `https://${cid}.ipfs.dweb.link/`,
      `https://${cid}.ipfs.cf-ipfs.com/`,
    ];
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's already an HTTP URL, try it first
    urlsToTry = [url];

    // If it's an IPFS gateway URL, also try alternative gateways
    const cid = extractCIDFromGatewayUrl(url);
    if (cid) {
      // Generate alternative URLs in both path and subdomain formats
      const alternativeUrls = [
        ...IPFS_GATEWAYS.map(gateway => `${gateway}${cid}`),
        `https://${cid}.ipfs.dweb.link/`,
        `https://${cid}.ipfs.cf-ipfs.com/`,
      ].filter(altUrl => altUrl !== url); // Don't retry the same URL

      urlsToTry.push(...alternativeUrls);
    }
  } else {
    return null;
  }

  // Try each URL until one succeeds
  for (const tryUrl of urlsToTry) {
    try {
      const response = await fetch(tryUrl, { mode: 'cors' });
      if (!response.ok) continue;

      const blob = await response.blob();

      const dataUri = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(typeof reader.result === 'string' ? reader.result : null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });

      if (dataUri) return dataUri;
    } catch (error) {
      void error;
      continue; // Try next gateway
    }
  }

  return null;
};
