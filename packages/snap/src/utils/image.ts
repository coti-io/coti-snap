const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
];

const FETCH_TIMEOUT_MS = 8000;
const LOCAL_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

const parseIPv4 = (hostname: string): number[] | null => {
  const parts = hostname.split('.');
  if (parts.length !== 4) {
    return null;
  }
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (
    octets.some(
      (octet) => !Number.isInteger(octet) || Number.isNaN(octet) || octet > 255,
    )
  ) {
    return null;
  }
  return octets;
};

const isPrivateOrLocalIPv4 = (hostname: string): boolean => {
  const octets = parseIPv4(hostname);
  if (!octets) {
    return false;
  }

  const first = octets[0];
  const second = octets[1];
  if (first === undefined || second === undefined) {
    return false;
  }
  if (first === 10 || first === 127) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  if (first === 192 && second === 168) {
    return true;
  }
  if (first === 169 && second === 254) {
    return true;
  }
  return false;
};

const isPrivateOrLocalIPv6 = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();

  if (normalized === '::1') {
    return true;
  }
  // Unique local addresses: fc00::/7
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  // Link-local addresses: fe80::/10 (fe8x, fe9x, feax, febx)
  if (/^fe[89ab]/u.test(normalized)) {
    return true;
  }
  // IPv4-mapped addresses, e.g. ::ffff:127.0.0.1
  if (normalized.startsWith('::ffff:')) {
    const mappedHost = normalized.slice('::ffff:'.length);
    return isPrivateOrLocalIPv4(mappedHost);
  }
  return false;
};

const validateExternalUrl = (uri: string): URL => {
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(`Invalid URL: ${uri}`);
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'https:' && protocol !== 'ipfs:') {
    throw new Error(`Unsupported URL scheme: ${protocol}`);
  }

  if (protocol === 'https:') {
    const hostname = parsed.hostname.toLowerCase();
    if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.local')) {
      throw new Error(`Blocked local hostname: ${hostname}`);
    }
    if (isPrivateOrLocalIPv4(hostname) || isPrivateOrLocalIPv6(hostname)) {
      throw new Error(`Blocked private network host: ${hostname}`);
    }
  }

  return parsed;
};

/**
 * Converts an ipfs:// URI to an HTTP gateway URL.
 * If the URI is already HTTP(S), returns it unchanged.
 * @param uri - IPFS or HTTP(S) URI.
 * @param gateway - IPFS gateway base URL.
 * @returns Resolved HTTP URL.
 */
const resolveIpfsUrl = (
  uri: string,
  gateway: string = IPFS_GATEWAYS[0] ?? '',
): string => {
  if (uri.startsWith('ipfs://')) {
    const cid = uri.slice('ipfs://'.length);
    return `${gateway}${cid}`;
  }
  return uri;
};

/**
 * Fetch with a timeout using AbortController.
 * @param url - URL to fetch.
 * @param timeoutMs - Timeout in milliseconds.
 * @returns Fetch Response.
 */
const fetchWithTimeout = async (
  url: string,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Response> => {
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
 * @param uri - IPFS or HTTP(S) URI to fetch.
 * @returns Fetch Response.
 */
const fetchWithGatewayFallback = async (uri: string): Promise<Response> => {
  const validatedUrl = validateExternalUrl(uri);
  if (validatedUrl.protocol !== 'ipfs:') {
    const response = await fetchWithTimeout(validatedUrl.toString());
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
    } catch (_err) {
      // try next gateway
      void _err;
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

    const imageUri: string | undefined =
      responseJson.image ?? responseJson.image_url;
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
  } catch (_err) {
    void _err;
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
