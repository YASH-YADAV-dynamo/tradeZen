import type { QuoteResponse, TokenAmount } from '../api/types';

export type QuoteTokenEntry = TokenAmount & { address: string };

/** First token entry from a buyTokens / sellTokens map. */
export const firstQuoteToken = (
  tokens: Record<string, TokenAmount>
): QuoteTokenEntry | null => {
  const [address, amount] = Object.entries(tokens)[0] ?? [];
  if (!address || !amount) return null;
  return { address, ...amount };
};

export const getSellToken = (quote: QuoteResponse) => firstQuoteToken(quote.sellTokens);
export const getBuyToken = (quote: QuoteResponse) => firstQuoteToken(quote.buyTokens);
