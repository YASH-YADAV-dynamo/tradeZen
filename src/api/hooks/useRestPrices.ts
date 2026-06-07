import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import { usePriceStore } from '../../store/priceStore';
import { useWalletChain } from '../../store/walletStore';
import { parsePriceUpdate } from '../../utils/parsePriceUpdate';

/**
 * Polls GET /api/prices?chain= as a REST fallback to the price WebSocket.
 *
 * The endpoint is public, so we poll for everyone (logged-in users and
 * guests browsing markets / token detail). Polling backs off once we've
 * received a fresh tick from any source within the last 15s.
 */
export const useRestPrices = () => {
  const chain = useWalletChain();
  const lastUpdated = usePriceStore((s) => s.lastUpdated);
  const wsConnected = usePriceStore((s) => s.wsConnected);

  const stale = Date.now() - lastUpdated > 15_000;
  // Don't hammer the API when the WS is healthy and recently delivered.
  const shouldPoll = stale || !wsConnected;

  const query = useQuery({
    queryKey: ['prices', chain],
    queryFn: async () => {
      const { data } = await api.get(apiPaths.prices, { params: { chain } });
      return data;
    },
    enabled: shouldPoll,
    refetchInterval: shouldPoll ? 15_000 : false,
    retry: 1,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const parsed = parsePriceUpdate(query.data);
    if (Object.keys(parsed).length > 0) {
      usePriceStore.getState().setPrices(parsed);
    }
  }, [query.data]);

  return query;
};
