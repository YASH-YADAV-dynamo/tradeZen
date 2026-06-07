import { useQuery } from '@tanstack/react-query';

import type { ChainSlug } from '../types';
import { type ChartRange, type ChartSeries, fetchTokenChart } from '../../services/coingecko';

/**
 * React Query wrapper around CoinGecko's market_chart endpoint.
 * Public data — no auth required.
 */
export const useTokenChart = (
  chain: ChainSlug,
  address: string | null | undefined,
  range: ChartRange = '7'
) =>
  useQuery<ChartSeries | null>({
    queryKey: ['token-chart', chain, address?.toLowerCase(), range],
    queryFn: () => (address ? fetchTokenChart(chain, address, range) : Promise.resolve(null)),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
