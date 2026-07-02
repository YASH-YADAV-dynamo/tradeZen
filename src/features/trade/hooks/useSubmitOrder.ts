import { useMutation } from '@tanstack/react-query';

import { orderService } from '../api';

export const useSubmitOrder = (token: string) =>
  useMutation({
    mutationFn: ({ quoteId, signature }: { quoteId: string; signature: string }) =>
      orderService.submitOrder(quoteId, signature, token),
  });
