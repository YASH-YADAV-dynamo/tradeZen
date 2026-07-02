import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ReconnectingSocket, buildWsUrl } from '../../../core/realtime';
import { env } from '../../../core/config/env';
import { orderService } from '../api';
import { OrderStatusUpdate, TERMINAL_ORDER_STATUSES } from '../types';

const orderQueryKey = (quoteId: string) => ['orderStatus', quoteId] as const;

/**
 * Mirrors useLivePrices' shape: open /ws/order/:quoteId for live pushes,
 * write every update straight into the react-query cache, and use the
 * owner-only REST endpoint as a fallback poll if the socket hasn't
 * connected yet. The socket closes itself once a terminal status
 * (Settled/Confirmed/Failed) arrives, matching the guide's guidance.
 */
export const useOrderStatus = (quoteId: string | undefined, token: string) => {
  const queryClient = useQueryClient();
  const isSocketConnected = useRef(false);

  const query = useQuery<OrderStatusUpdate>({
    queryKey: orderQueryKey(quoteId ?? ''),
    queryFn: () => orderService.getStatus(quoteId!, token),
    enabled: Boolean(quoteId && token),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status && TERMINAL_ORDER_STATUSES.has(status)) return false;
      return isSocketConnected.current ? false : env.orderFallbackPollMs;
    },
  });

  useEffect(() => {
    if (!quoteId) return;
    isSocketConnected.current = false;

    const socket = new ReconnectingSocket<OrderStatusUpdate>(buildWsUrl(`/ws/order/${quoteId}`), {
      onOpen: () => {
        isSocketConnected.current = true;
      },
      onClose: () => {
        isSocketConnected.current = false;
      },
      onMessage: (update) => {
        queryClient.setQueryData(orderQueryKey(quoteId), update);
        if (TERMINAL_ORDER_STATUSES.has(update.status)) socket.close();
      },
    });

    socket.connect();
    return () => socket.close();
  }, [quoteId, queryClient]);

  return query;
};
