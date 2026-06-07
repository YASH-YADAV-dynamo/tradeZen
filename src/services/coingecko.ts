/**
 * Public CoinGecko market chart fetcher.
 *
 * Bebop does not expose historical OHLCV, so for the chart UI we use
 * CoinGecko's free public endpoint scoped to a chain + contract address.
 * No API key required (10–30 calls/min per IP on the free tier).
 */

import type { ChainSlug } from '../api/types';

/** Map our chain slugs onto the platform IDs CoinGecko expects. */
const CHAIN_TO_PLATFORM: Record<string, string> = {
  ethereum: 'ethereum',
  arbitrum: 'arbitrum-one',
  polygon: 'polygon-pos',
  base: 'base',
  bsc: 'binance-smart-chain',
  optimism: 'optimistic-ethereum',
  avalanche: 'avalanche',
};

export type ChartRange = '1' | '7' | '30' | '90' | '365';

export interface ChartPoint {
  t: number; // unix ms
  v: number; // USD price
}

export interface ChartSeries {
  range: ChartRange;
  points: ChartPoint[];
  changePct: number;
}

const BASE_URL = 'https://api.coingecko.com/api/v3';

const computeChangePct = (points: ChartPoint[]): number => {
  if (points.length < 2) return 0;
  const first = points[0].v;
  const last = points[points.length - 1].v;
  if (first === 0) return 0;
  return ((last - first) / first) * 100;
};

/**
 * Fetches a price series for a token on a given chain. Returns null when
 * the token isn't indexed by CoinGecko (most long-tail Bebop tokens).
 */
export const fetchTokenChart = async (
  chain: ChainSlug,
  address: string,
  range: ChartRange = '7'
): Promise<ChartSeries | null> => {
  const platform = CHAIN_TO_PLATFORM[chain];
  if (!platform || !address) return null;

  const url =
    `${BASE_URL}/coins/${platform}/contract/${address.toLowerCase()}` +
    `/market_chart?vs_currency=usd&days=${range}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { prices?: [number, number][] };
    if (!Array.isArray(body.prices) || body.prices.length === 0) return null;
    const points: ChartPoint[] = body.prices.map(([t, v]) => ({ t, v }));
    return { range, points, changePct: computeChangePct(points) };
  } catch {
    return null;
  }
};
