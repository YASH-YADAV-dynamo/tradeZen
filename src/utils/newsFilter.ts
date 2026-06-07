import type { NewsFilter, NewsItem } from '../api/types';

/**
 * Pure client-side filter for the in-memory news feed.
 *
 * The backend (v2.4) recommends one wide fetch (`GET /api/news?limit=50`) plus
 * one SSE stream (`?all=true`) — every view derives its slice from the same
 * `newsStore.items[]` via this helper. Keep predicates cheap and order
 * coarse-to-fine so we short-circuit out of the loop ASAP.
 */
export function filterNews(items: NewsItem[], f: NewsFilter | undefined): NewsItem[] {
  if (!f) return items;

  const symbolSet = f.symbols ? new Set(f.symbols.map((s) => s.toUpperCase())) : null;
  const typeSet = f.assetTypes ? new Set(f.assetTypes) : null;
  const sourceSet = f.sources ? new Set(f.sources) : null;
  const needle = f.search?.toLowerCase().trim() || null;
  const minImp = f.minImportance ?? null;
  const minScore = f.minScore ?? null;
  const sinceTs = f.sinceTs ?? null;
  const sentiment = f.sentiment ?? null;

  return items.filter((it) => {
    if (typeSet && !typeSet.has(it.assetType)) return false;
    if (sourceSet && !sourceSet.has(it.source)) return false;
    if (minImp != null && it.importance < minImp) return false;
    if (sentiment && it.sentiment !== sentiment) return false;
    if (minScore != null && Math.abs(it.sentimentScore ?? 0) < minScore) return false;
    if (sinceTs != null && it.publishedAt < sinceTs) return false;

    if (symbolSet) {
      const hit =
        it.relatedSymbols?.some((s) => symbolSet.has(s.toUpperCase())) ||
        (it.tokenSymbol ? symbolSet.has(it.tokenSymbol.toUpperCase()) : false);
      if (!hit) return false;
    }
    if (needle) {
      const hay = `${it.title} ${it.summary}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

/**
 * Tokens are matched by symbol AND optional contract address — Bebop token
 * symbols (e.g. AAPLx) sometimes differ from the upstream news ticker (AAPL),
 * so we accept both forms and the address as a fallback.
 */
export function newsForToken(
  items: NewsItem[],
  opts: { symbol?: string | null; address?: string | null; aliases?: string[] }
): NewsItem[] {
  const symbols = new Set<string>();
  if (opts.symbol) {
    const upper = opts.symbol.toUpperCase();
    symbols.add(upper);
    // Strip xStock suffix so AAPLx → AAPL still matches Benzinga/AV tickers.
    if (upper.endsWith('X')) symbols.add(upper.slice(0, -1));
  }
  for (const alias of opts.aliases ?? []) symbols.add(alias.toUpperCase());
  const addr = opts.address?.toLowerCase() ?? null;

  return items.filter((it) => {
    if (addr && it.tokenAddress?.toLowerCase() === addr) return true;
    if (it.tokenSymbol && symbols.has(it.tokenSymbol.toUpperCase())) return true;
    if (it.relatedSymbols?.some((s) => symbols.has(s.toUpperCase()))) return true;
    return false;
  });
}
