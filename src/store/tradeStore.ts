import { create } from 'zustand';

import type { QuoteResponse } from '../api/types';
import type { UIToken } from '../utils/token';

interface TradeState {
  sellToken: UIToken | null;
  buyToken: UIToken | null;
  sellAmount: string;
  quote: QuoteResponse | null;
  isQuoteLoading: boolean;
  quoteError: string | null;
  setSellToken: (t: UIToken) => void;
  setBuyToken: (t: UIToken) => void;
  setSellAmount: (a: string) => void;
  setQuote: (q: QuoteResponse | null) => void;
  setQuoteLoading: (v: boolean) => void;
  setQuoteError: (e: string | null) => void;
  swapTokens: () => void;
  reset: () => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  sellToken: null,
  buyToken: null,
  sellAmount: '',
  quote: null,
  isQuoteLoading: false,
  quoteError: null,
  setSellToken: (sellToken) => set({ sellToken, quote: null, quoteError: null }),
  setBuyToken: (buyToken) => set({ buyToken, quote: null, quoteError: null }),
  setSellAmount: (sellAmount) => set({ sellAmount, quote: null, quoteError: null }),
  setQuote: (quote) => set({ quote }),
  setQuoteLoading: (isQuoteLoading) => set({ isQuoteLoading }),
  setQuoteError: (quoteError) => set({ quoteError }),
  swapTokens: () =>
    set((s) => ({
      sellToken: s.buyToken,
      buyToken: s.sellToken,
      quote: null,
      quoteError: null,
    })),
  reset: () =>
    set({
      sellToken: null,
      buyToken: null,
      sellAmount: '',
      quote: null,
      isQuoteLoading: false,
      quoteError: null,
    }),
}));
