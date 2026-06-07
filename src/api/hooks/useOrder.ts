import { useMutation } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { OrderRequest, OrderResponse } from '../types';
import { useOrderStore } from '../../store/orderStore';

export const useOrder = () => {
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);

  return useMutation<OrderResponse, Error, OrderRequest>({
    mutationFn: async (req) => {
      const { data } = await api.post<OrderResponse>(apiPaths.order, req);
      return data;
    },
    onSuccess: (order, vars) => {
      setActiveOrder({ ...order, quoteId: vars.quoteId });
    },
  });
};
