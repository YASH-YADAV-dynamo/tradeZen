import { create } from 'zustand';

import { parsePriceUpdate } from '../utils/parsePriceUpdate';

interface PriceState {
  prices: Record<string, number>;
  lastUpdated: number;
  wsConnected: boolean;
  ingest: (raw: unknown) => void;
  setPrices: (prices: Record<string, number>) => void;
  setWsConnected: (connected: boolean) => void;
  getPrice: (address: string) => number | undefined;
}

const EPSILON = 0.0000001;

const applyDelta = (
  current: Record<string, number>,
  incoming: Record<string, number>
): { next: Record<string, number>; changed: boolean } => {
  let changed = false;
  const next = { ...current };
  for (const key in incoming) {
    const lc = key.toLowerCase();
    const v = incoming[key];
    if (next[lc] === undefined || Math.abs(next[lc] - v) > EPSILON) {
      next[lc] = v;
      changed = true;
    }
  }
  return { next, changed };
};

export const usePriceStore = create<PriceState>((set, get) => ({
  prices: {},
  lastUpdated: 0,
  wsConnected: false,
  ingest: (raw) => {
    const parsed = parsePriceUpdate(raw);
    if (!parsed || Object.keys(parsed).length === 0) return;
    const { next, changed } = applyDelta(get().prices, parsed);
    if (!changed) return;
    set({ prices: next, lastUpdated: Date.now() });
  },
  setPrices: (prices) => {
    if (!prices || Object.keys(prices).length === 0) return;
    const { next, changed } = applyDelta(get().prices, prices);
    if (!changed) return;
    set({ prices: next, lastUpdated: Date.now() });
  },
  setWsConnected: (wsConnected) => {
    if (get().wsConnected === wsConnected) return;
    set({ wsConnected });
  },
  getPrice: (address) => get().prices[address.toLowerCase()],
}));

/** Subscribe to a single token's price (re-renders only when that token changes). */
export const useTokenPrice = (address?: string | null): number | undefined =>
  usePriceStore((s) => (address ? s.prices[address.toLowerCase()] : undefined));
