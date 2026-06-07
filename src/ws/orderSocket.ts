import type { OrderStatus } from '../api/types';
import { apiPaths } from '../api/backend';
import { IS_WEB } from '../platform';
import { useOrderStore } from '../store/orderStore';
import { getWsBaseUrl } from '../utils/apiUrl';

let orderWs: WebSocket | null = null;

const hasWebSocket = (): boolean =>
  typeof WebSocket !== 'undefined' && (typeof window !== 'undefined' || !IS_WEB);

const terminalStatuses = new Set(['Settled', 'Confirmed', 'Failed']);

/** Subscribes to order status pushes for a single quoteId. */
export function connectOrderSocket(quoteId: string): void {
  if (!quoteId || !hasWebSocket()) return;
  try {
    orderWs?.close();
  } catch {
    /* noop */
  }

  orderWs = new WebSocket(`${getWsBaseUrl()}${apiPaths.orderWS(quoteId)}`);

  orderWs.onmessage = (event) => {
    try {
      const status = JSON.parse(event.data as string) as OrderStatus;
      useOrderStore.getState().setStatus(status);
      if (terminalStatuses.has(status.status)) {
        orderWs?.close();
      }
    } catch {
      /* Ignore malformed payloads. */
    }
  };

  orderWs.onclose = () => {
    orderWs = null;
  };

  orderWs.onerror = () => {
    try {
      orderWs?.close();
    } catch {
      /* noop */
    }
  };
}

export function disconnectOrderSocket(): void {
  try {
    orderWs?.close();
  } catch {
    /* noop */
  }
  orderWs = null;
}
