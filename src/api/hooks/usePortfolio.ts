import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { PortfolioResponse } from '../types';
import { usePriceStore } from '../../store/priceStore';
import { useWalletStore } from '../../store/walletStore';

export const usePortfolio = (size = 50) => {
  const chain = useWalletStore((s) => s.chain);
  const jwt = useWalletStore((s) => s.jwt);
  const query = useQuery<PortfolioResponse>({
    queryKey: ['portfolio', chain],
    queryFn: async () => {
      const { data } = await api.get<PortfolioResponse>(apiPaths.portfolio, {
        params: { chain, size },
      });
      return data;
    },
    enabled: !!jwt,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const markPrices = query.data?.markPrices;
    if (markPrices && Object.keys(markPrices).length > 0) {
      usePriceStore.getState().setPrices(markPrices);
    }
  }, [query.data?.markPrices]);

  return query;
};
