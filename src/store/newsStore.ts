import { useMemo } from 'react';
import { create } from 'zustand';

import { useTradeableNewsIndex } from '../hooks/useTradeableNewsIndex';
import type { NewsFilter, NewsItem } from '../api/types';
import { filterNews, newsForToken } from '../utils/newsFilter';
import { filterTradeableNews } from '../utils/tradeableNews';

/**
 * Single source of truth for ALL news views. Following the v2.4 backend
 * recommendation:
 *   - REST: GET /api/news?limit=50  (one shot on boot)
 *   - SSE:  /sse/news?all=true       (one connection per session)
 * Every view derives via filterNews(items, ...).
 *
 * Cap the in-memory list at 200 — the home feed only shows ~50, and we want a
 * comfortable margin for client-side filters (e.g. "stocks only") without
 * paying for a re-fetch.
 */
const MAX_ITEMS = 200;

interface NewsState {
  items: NewsItem[];
  lastUpdated: number;
  seed: (items: NewsItem[]) => void;
  addItem: (item: NewsItem) => void;
  clear: () => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  items: [],
  lastUpdated: 0,
  seed: (items) =>
    set({
      items: items.slice(0, MAX_ITEMS),
      lastUpdated: Date.now(),
    }),
  addItem: (item) =>
    set((s) => {
      if (s.items.some((existing) => existing.id === item.id)) return s;
      return {
        items: [item, ...s.items].slice(0, MAX_ITEMS),
        lastUpdated: Date.now(),
      };
    }),
  clear: () => set({ items: [], lastUpdated: 0 }),
}));

/**
 * Derived selector for a filtered slice. Use this from screens — do NOT
 * filter inside `useNewsStore(s => filterNews(s.items, f))` directly, since
 * that re-allocates on every store update; this hook memoizes against `items`
 * + a stable filter key.
 */
export function useFilteredNews(f?: NewsFilter): NewsItem[] {
  const items = useNewsStore((s) => s.items);
  const key = filterKey(f);
  return useMemo(() => filterNews(items, f), [items, key]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Like useFilteredNews but only headlines tied to tradeable app pairs. */
export function useTradeableFilteredNews(f?: NewsFilter): NewsItem[] {
  const items = useNewsStore((s) => s.items);
  const index = useTradeableNewsIndex();
  const key = filterKey(f);
  return useMemo(() => {
    const scoped = filterTradeableNews(items, index);
    return filterNews(scoped, f);
  }, [items, index, key]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useNewsForToken(opts: {
  symbol?: string | null;
  address?: string | null;
  aliases?: string[];
}): NewsItem[] {
  const items = useNewsStore((s) => s.items);
  const index = useTradeableNewsIndex();
  const { symbol, address, aliases } = opts;
  const aliasKey = (aliases ?? []).join(',');
  return useMemo(() => {
    const scoped = filterTradeableNews(items, index);
    return newsForToken(scoped, { symbol, address, aliases });
  }, [items, index, symbol, address, aliasKey]); // eslint-disable-line react-hooks/exhaustive-deps
}

function filterKey(f?: NewsFilter): string {
  if (!f) return '';
  return JSON.stringify({
    s: f.symbols?.slice().sort(),
    a: f.assetTypes?.slice().sort(),
    src: f.sources?.slice().sort(),
    mi: f.minImportance,
    sen: f.sentiment,
    ms: f.minScore,
    st: f.sinceTs,
    q: f.search,
  });
}
