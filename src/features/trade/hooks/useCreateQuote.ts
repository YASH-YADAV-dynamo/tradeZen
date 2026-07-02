import { useMutation } from '@tanstack/react-query';

import { quoteService } from '../api';
import { QuoteRequest } from '../types';

export const useCreateQuote = (token: string) =>
  useMutation({
    mutationFn: (request: QuoteRequest) => quoteService.createQuote(request, token),
  });
