import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

import {
  COTI_MAINNET_CHAIN_ID,
  COTI_TESTNET_CHAIN_ID,
} from '../config/wagmi';
import type { ImportedToken } from '../types/token';

export type PreloadedToken = ImportedToken;

const TOKEN_LIST_URLS: Record<number, string> = {
  [COTI_MAINNET_CHAIN_ID]:
    'https://raw.githubusercontent.com/coti-io/coti-token-list/refs/heads/coti-mainnet/coti_tokens.json',
  [COTI_TESTNET_CHAIN_ID]:
    'https://raw.githubusercontent.com/coti-io/coti-token-list/refs/heads/coti-testnet/coti_tokens.json',
};

type RemoteToken = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  private?: boolean;
};

type TokenListResponse = {
  tokens: RemoteToken[];
};

function remoteToPreloaded(token: RemoteToken): PreloadedToken {
  const isPrivate = token.private === true;
  return {
    address: token.address,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    type: 'ERC20',
    logoURI: token.logoURI,
    ...(isPrivate && { isPrivate: true }),
  };
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
        // If fetch fails, tokens remain empty
      }
    };

    void fetchList();
    return () => {
      cancelled = true;
    };
  }, [chainId, tokens]);

  return (chainId && tokens[chainId]) ? tokens[chainId] : [];
};
