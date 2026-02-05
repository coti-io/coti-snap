const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
];

const FETCH_TIMEOUT_MS = 8000;

/**
 * Converts an ipfs:// URI to an HTTP gateway URL.
 * If the URI is already HTTP(S), returns it unchanged.
 */
const resolveIpfsUrl = (uri: string, gateway: string = IPFS_GATEWAYS[0]!): string => {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.slice('ipfs://'.length);
    return `${gateway}${cid}`;
  }
  return uri;
};

/**
 * Fetch with a timeout using AbortController.
 */
const fetchWithTimeout = async (url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Tries to fetch a URL, falling back through IPFS gateways if the URI is ipfs://.
 * For non-IPFS URLs, just fetches directly with timeout.
 */
const fetchWithGatewayFallback = async (uri: string): Promise<Response> => {
  if (!uri.startsWith('ipfs://')) {
    const response = await fetchWithTimeout(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response;
  }

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = resolveIpfsUrl(uri, gateway);
      const response = await fetchWithTimeout(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // try next gateway
    }
  }
  throw new Error(`All IPFS gateways failed for: ${uri}`);
};

export const getSVGfromMetadata = async (
  url: string,
): Promise<string | null> => {
  try {
    const metadataResponse = await fetchWithGatewayFallback(url);
    const responseJson = await metadataResponse.json();

    const imageUri: string | undefined = responseJson.image || responseJson.image_url;
    if (!imageUri) {
      throw new Error('No image found in metadata');
    }

    const imageResponse = await fetchWithGatewayFallback(imageUri);
    const blob = await imageResponse.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = blob.type || 'image/png';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">
        <image href="data:${mimeType};base64,${base64}" width="200" height="200"/>
      </svg>
    `;
  } catch {
    return null;
  }
};

/**
 * Generates an SVG avatar with the first letter of the token symbol
 * @param symbol - The token symbol
 * @returns SVG string with gray background and first letter
 */
export const generateTokenAvatar = (symbol: string): string => {
  const firstLetter = symbol.charAt(0).toUpperCase();
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="16" fill="#CCCCCC"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="400" fill="#000000" text-anchor="middle" dominant-baseline="central">${firstLetter}</text>
    </svg>
  `;
};
