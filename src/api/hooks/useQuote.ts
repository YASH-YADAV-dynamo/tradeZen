import { useMutation } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { QuoteRequest, QuoteResponse } from '../types';
import { useTradeStore } from '../../store/tradeStore';

export const useQuote = () => {
  const setQuote = useTradeStore((s) => s.setQuote);
  const setQuoteLoading = useTradeStore((s) => s.setQuoteLoading);
  const setQuoteError = useTradeStore((s) => s.setQuoteError);

  return useMutation<QuoteResponse, Error, QuoteRequest>({
    mutationFn: async (req) => {
      const { data } = await api.post<QuoteResponse>(apiPaths.quote, req);
      return data;
    },
    onMutate: () => {
      setQuoteLoading(true);
      setQuoteError(null);
    },
    onSuccess: (quote) => {
      setQuote(quote);
      setQuoteLoading(false);
    },
    onError: (err) => {
      setQuoteError(err.message);
      setQuoteLoading(false);
    },
  });
};
