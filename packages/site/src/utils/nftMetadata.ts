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
  return 'https://ipfs.io/ipfs/';
};

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

export const fetchImageAsDataUri = async (url: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !url) return null;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;

    const blob = await response.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    void error;
    return null;
  }
};
