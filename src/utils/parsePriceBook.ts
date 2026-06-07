import type { PriceSnapshot } from '../api/types';

/** Converts WS order-book snapshot to lowercase address → mid USD price. */
export const parsePriceBook = (snapshot: PriceSnapshot): Record<string, number> => {
  const prices: Record<string, number> = {};

  for (const [pairKey, book] of Object.entries(snapshot)) {
    if (!pairKey.includes('/') || !book || typeof book !== 'object') continue;

    const base = pairKey.split('/')[0];
    const bestBid = Number(book.bids?.[0]?.[0]);
    const bestAsk = Number(book.asks?.[0]?.[0]);
    if (!base || !Number.isFinite(bestBid) || !Number.isFinite(bestAsk)) continue;

    prices[base.toLowerCase()] = (bestBid + bestAsk) / 2;
  }

  return prices;
};
