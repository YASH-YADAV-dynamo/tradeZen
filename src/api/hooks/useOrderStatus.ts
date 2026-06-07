import { useQuery } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { OrderStatus } from '../types';

export const useOrderStatus = (quoteId?: string | null, poll = false) =>
  useQuery<OrderStatus>({
    queryKey: ['order', quoteId],
    queryFn: async () => {
      const { data } = await api.get<OrderStatus>(apiPaths.orderStatus(quoteId!));
      return data;
    },
    enabled: !!quoteId,
    refetchInterval: poll ? 2000 : false,
  });
