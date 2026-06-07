import type { MarketPair } from '../types/market';

export type MarketFilter = 'all' | 'favorites' | 'buy' | 'sell';

interface SearchableMarket {
  pair: MarketPair;
  haystack: string;
  base: string;
  symbol: string;
  name: string;
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const characterRank = (candidate: string, query: string) => {
  let cursor = 0;
  let firstMatch = -1;
  let gaps = 0;

  for (const char of query) {
    const index = candidate.indexOf(char, cursor);
    if (index === -1) return Number.POSITIVE_INFINITY;
    if (firstMatch === -1) firstMatch = index;
    gaps += index - cursor;
    cursor = index + 1;
  }

  return 20 + firstMatch * 2 + gaps + candidate.length * 0.01;
};

const score = (market: SearchableMarket, query: string) => {
  if (!query) return 0;
  if (market.base === query || market.symbol === query) return 0;
  if (market.base.startsWith(query) || market.symbol.startsWith(query)) return 1;
  if (market.name.startsWith(query)) return 2;
  if (market.haystack.includes(query)) return 4 + market.haystack.indexOf(query) * 0.01;
  return characterRank(market.haystack, query);
};

export const toSearchableMarkets = (pairs: MarketPair[]): SearchableMarket[] =>
  pairs.map((pair) => {
    const base = normalize(pair.symbol);
    const symbol = base;
    const name = normalize(pair.name);
    return { pair, base, symbol, name, haystack: `${base}${symbol}${name}` };
  });

export const filterMarkets = (
  pairs: MarketPair[],
  options: {
    filter: MarketFilter;
    favorites: string[];
    query: string;
  }
): MarketPair[] => {
  let list = toSearchableMarkets(pairs);

  if (options.filter === 'favorites') {
    list = list.filter(({ pair }) => options.favorites.includes(pair.symbol));
  } else if (options.filter === 'buy') {
    list = list.filter(({ pair }) => pair.canBuy);
  } else if (options.filter === 'sell') {
    list = list.filter(({ pair }) => pair.canSell);
  }

  const normalizedQuery = normalize(options.query.trim().toLowerCase());
  if (!normalizedQuery) return list.map(({ pair }) => pair);

  return list
    .map((market) => ({ market, rank: score(market, normalizedQuery) }))
    .filter(({ rank }) => Number.isFinite(rank))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.market.symbol.length - b.market.symbol.length ||
        a.market.pair.symbol.localeCompare(b.market.pair.symbol)
    )
    .map(({ market }) => market.pair);
};
