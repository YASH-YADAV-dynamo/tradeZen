import { useEffect, useMemo } from 'react';

import { usePriceStore } from '../../store/priceStore';
import { useWalletChain } from '../../store/walletStore';
import type { MarketPair } from '../../types/market';
import { lookupTokenPrice } from '../../utils/price';
import { subscribePriceFeed } from '../../ws/priceSocket';
import { useRestPrices } from './useRestPrices';
import { useTokens } from './useTokens';

/**
 * Composes UI MarketPair[] from cached tokens + live WS/REST price feed.
 * Opens the price feed for the active chain while mounted.
 */
export const useMarketPairs = () => {
  const chain = useWalletChain();
  const prices = usePriceStore((s) => s.prices);
  const tokensQuery = useTokens();
  useRestPrices();

  useEffect(() => {
    if (!chain) return;
    const unsubscribe = subscribePriceFeed(chain);
    return unsubscribe;
  }, [chain]);

  const data = useMemo<MarketPair[] | undefined>(() => {
    if (!tokensQuery.data) return undefined;
    return tokensQuery.data.map((token) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      logo: token.logoURI,
      chain: token.chain,
      decimals: token.decimals,
      canBuy: token.canBuy,
      canSell: token.canSell,
      price: lookupTokenPrice(token.address, prices),
      isTradingHalted: !token.canBuy && !token.canSell,
    }));
  }, [tokensQuery.data, prices]);

  return {
    data,
    isLoading: tokensQuery.isLoading,
    isRefetching: tokensQuery.isRefetching,
    isError: tokensQuery.isError,
    error: tokensQuery.error,
    refetch: tokensQuery.refetch,
  };
};
