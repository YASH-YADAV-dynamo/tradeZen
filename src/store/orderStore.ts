import { create } from 'zustand';

import type { OrderResponse, OrderStatus } from '../api/types';

export type ActiveOrder = OrderResponse & { quoteId: string };

const TERMINAL = new Set(['Settled', 'Confirmed', 'Failed']);

interface OrderState {
  activeOrder: ActiveOrder | null;
  status: OrderStatus | null;
  history: OrderResponse[];
  /** Timestamp (ms) of the last status update — used to detect stale WS. */
  lastUpdatedAt: number;
  setActiveOrder: (order: ActiveOrder) => void;
  setStatus: (status: OrderStatus) => void;
  clearActive: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  activeOrder: null,
  status: null,
  history: [],
  lastUpdatedAt: 0,
  setActiveOrder: (activeOrder) =>
    set({ activeOrder, status: null, lastUpdatedAt: Date.now() }),
  setStatus: (status) =>
    set((s) => {
      const isTerminal = TERMINAL.has(status.status);
      const nextActive: ActiveOrder = s.activeOrder
        ? {
            ...s.activeOrder,
            orderId: status.orderId,
            status: status.status,
            txHash: status.txHash,
          }
        : {
            orderId: status.orderId,
            status: status.status,
            txHash: status.txHash,
            quoteId: status.orderId,
          };
      return {
        status,
        activeOrder: nextActive,
        lastUpdatedAt: Date.now(),
        history: isTerminal
          ? [
              ...s.history,
              {
                orderId: status.orderId,
                status: status.status,
                txHash: status.txHash,
              },
            ]
          : s.history,
      };
    }),
  clearActive: () => set({ activeOrder: null, status: null, lastUpdatedAt: 0 }),
}));
