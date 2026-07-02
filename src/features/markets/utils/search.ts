import { Token } from '../types';

export interface SearchableToken {
  token: Token;
  haystack: string;
  symbol: string;
  name: string;
}

export const normalizeSearch = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export const toSearchableToken = (token: Token): SearchableToken => {
  const symbol = normalizeSearch(token.symbol);
  const name = normalizeSearch(token.name);
  return { token, symbol, name, haystack: `${symbol}${name}` };
};

const getCharacterRank = (candidate: string, query: string): number => {
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

/** Lower is better; ranks exact/prefix/substring/fuzzy matches in that order. */
export const scoreToken = (entry: SearchableToken, query: string): number => {
  if (!query) return 0;
  if (entry.symbol === query) return 0;
  if (entry.symbol.startsWith(query)) return 1;
  if (entry.name.startsWith(query)) return 2;
  if (entry.haystack.includes(query)) return 4 + entry.haystack.indexOf(query) * 0.01;
  return getCharacterRank(entry.haystack, query);
};

/** Ranks and sorts a list of tokens against a (normalized) search query. */
export const searchTokens = (entries: SearchableToken[], normalizedQuery: string): Token[] => {
  if (!normalizedQuery) return entries.map(({ token }) => token);

  return entries
    .map((entry) => ({ entry, rank: scoreToken(entry, normalizedQuery) }))
    .filter(({ rank }) => Number.isFinite(rank))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.entry.symbol.length - b.entry.symbol.length ||
        a.entry.token.symbol.localeCompare(b.entry.token.symbol)
    )
    .map(({ entry }) => entry.token);
};
