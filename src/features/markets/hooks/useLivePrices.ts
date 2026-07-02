import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ReconnectingSocket, buildWsUrl } from '../../../core/realtime';
import { env } from '../../../core/config/env';
import { pricesService } from '../api';
import { Chain, PriceSnapshot } from '../types';

const priceQueryKey = (chain: Chain) => ['prices', chain] as const;

/**
 * Implements the app-boot price strategy from the integration guide (§3.5,
 * §3.12, §4.4): `/ws/prices` is the live primary source, `/api/prices` is
 * the seed + fallback. Rather than keeping prices in a zustand store that
 * the socket writes to and components read from separately, the socket
 * writes straight into the react-query cache for `['prices', chain]` via
 * `setQueryData` — so there's exactly one place a screen reads current
 * prices from, whether the data just arrived over REST or over the socket.
 *
 * `refetchInterval` only kicks in once the socket has gone quiet, giving
 * the "poll every ~15s as a belt-and-suspenders fallback" behavior the docs
 * recommend without ever running both sources at once while the socket is
 * healthy.
 */
export const useLivePrices = (chain: Chain) => {
  const queryClient = useQueryClient();
  const isSocketConnected = useRef(false);

  const query = useQuery<PriceSnapshot>({
    queryKey: priceQueryKey(chain),
    queryFn: () => pricesService.getSnapshot(chain),
    staleTime: 10_000,
    refetchInterval: () => (isSocketConnected.current ? false : env.priceFallbackPollMs),
  });

  useEffect(() => {
    isSocketConnected.current = false;

    const socket = new ReconnectingSocket<PriceSnapshot>(buildWsUrl('/ws/prices', { chain }), {
      onOpen: () => {
        isSocketConnected.current = true;
      },
      onClose: () => {
        isSocketConnected.current = false;
      },
      onMessage: (snapshot) => {
        queryClient.setQueryData(priceQueryKey(chain), snapshot);
      },
    });

    socket.connect();
    return () => socket.close();
  }, [chain, queryClient]);

  return query;
};

/** Convenience lookup: current price for one token address (case-insensitive). */
export const priceForAddress = (
  snapshot: PriceSnapshot | undefined,
  address: string
): number | undefined => snapshot?.prices[address.toLowerCase()];
