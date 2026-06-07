import type { NewsItem } from '../api/types';
import type { UIToken } from './token';

/** Wrapped tokens whose news often uses the base ticker (WETH → ETH). */
const BASE_ALIASES: Record<string, string[]> = {
  WETH: ['ETH'],
  WBTC: ['BTC'],
  WMATIC: ['MATIC', 'POL'],
  WBNB: ['BNB'],
  WAVAX: ['AVAX'],
  WSTETH: ['STETH', 'ETH'],
  CBETH: ['ETH'],
  RETH: ['ETH'],
};

export type TradeableNewsIndex = {
  symbols: Set<string>;
  addresses: Set<string>;
};

/**
 * Build a lookup index from the live token list so we only surface news that
 * maps to a pair the user can actually trade in the app.
 */
export function buildTradeableNewsIndex(tokens: UIToken[]): TradeableNewsIndex {
  const symbols = new Set<string>();
  const addresses = new Set<string>();

  for (const token of tokens) {
    if (!token.canBuy && !token.canSell) continue;

    const upper = token.symbol.toUpperCase();
    symbols.add(upper);

    // xStock tickers (AAPLx) also match plain equity symbols (AAPL).
    if (upper.endsWith('X') && upper.length > 1) {
      symbols.add(upper.slice(0, -1));
    }

    for (const alias of BASE_ALIASES[upper] ?? []) {
      symbols.add(alias.toUpperCase());
    }

    if (token.address) {
      addresses.add(token.address.toLowerCase());
    }
  }

  return { symbols, addresses };
}

/** True when a headline references at least one tradeable token in the app. */
export function isNewsForTradeable(item: NewsItem, index: TradeableNewsIndex): boolean {
  if (item.tokenAddress && index.addresses.has(item.tokenAddress.toLowerCase())) {
    return true;
  }

  if (item.tokenSymbol && index.symbols.has(item.tokenSymbol.toUpperCase())) {
    return true;
  }

  for (const raw of item.relatedSymbols ?? []) {
    const sym = raw.toUpperCase();
    if (index.symbols.has(sym)) return true;
    if (sym.endsWith('X') && index.symbols.has(sym.slice(0, -1))) return true;
  }

  return false;
}

export function filterTradeableNews(
  items: NewsItem[],
  index: TradeableNewsIndex | null
): NewsItem[] {
  if (!index || index.symbols.size === 0) return [];
  return items.filter((item) => isNewsForTradeable(item, index));
}
