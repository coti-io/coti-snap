import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import {
  COTI_MAINNET_CHAIN_ID,
  COTI_TESTNET_CHAIN_ID,
} from '../config/wagmi';
import { PRELOADED_TOKENS } from '../constants/preloadedTokens';
import type { PreloadedToken } from '../constants/preloadedTokens';

const TOKEN_LIST_URLS: Record<number, string> = {
  [COTI_MAINNET_CHAIN_ID]:
    'https://raw.githubusercontent.com/coti-io/coti-token-list/refs/heads/coti-mainnet/CotiTokenList.json',
  [COTI_TESTNET_CHAIN_ID]:
    'https://raw.githubusercontent.com/coti-io/coti-token-list/refs/heads/coti-testnet/CotiTokenList.json',
};

type RemoteToken = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

type TokenListResponse = {
  tokens: RemoteToken[];
};

// Symbols we have local SVG icons for (normalised to uppercase, no dots/underscores)
const LOCAL_ICON_SYMBOLS = new Set([
  'WETH', 'WBTC', 'USDT', 'USDCE', 'WADA', 'GCOTI', 'COTI',
]);

function normaliseSymbol(symbol: string): string {
  return symbol.replace(/^p\./i, '').toUpperCase().replace(/[._]/g, '');
}

function remoteToPreloaded(token: RemoteToken): PreloadedToken {
  const isPrivate = token.symbol.toLowerCase().startsWith('p.');
  const hasLocalIcon = LOCAL_ICON_SYMBOLS.has(normaliseSymbol(token.symbol));
  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    type: 'ERC20',
    ...(isPrivate && { isPrivate: true }),
    ...(!hasLocalIcon && { logoURI: token.logoURI }),
  } as PreloadedToken;
}

export const useTokenList = (): PreloadedToken[] => {
  const { chain } = useAccount();
  const chainId = chain?.id;

  const [tokens, setTokens] = useState<Record<number, PreloadedToken[]>>({});

  useEffect(() => {
    if (!chainId || !TOKEN_LIST_URLS[chainId]) {
      return;
    }

    // Already fetched for this chain
    if (tokens[chainId]) {
      return;
    }

    let cancelled = false;

    const fetchList = async () => {
      try {
        const res = await fetch(TOKEN_LIST_URLS[chainId]!);
        if (!res.ok) {
          return;
        }
        const data: TokenListResponse = await res.json();
        const fetched = data.tokens
          .filter((t) => t.chainId === chainId)
          .map(remoteToPreloaded);

        if (!cancelled && fetched.length > 0) {
          setTokens((prev) => ({ ...prev, [chainId]: fetched }));
        }
      } catch {
        // silently fall back to static list
      }
    };

    void fetchList();
    return () => {
      cancelled = true;
    };
  }, [chainId, tokens]);

  if (chainId && tokens[chainId]) {
    return tokens[chainId];
  }

  return PRELOADED_TOKENS[chainId ?? 0] ?? [];
};
