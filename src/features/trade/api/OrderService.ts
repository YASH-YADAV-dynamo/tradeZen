import { ApiClient } from '../../../core/api';
import { OrderResponse, OrderStatusUpdate } from '../types';

/**
 * Owns the gasless order-submission path: trading a signed EIP-712 payload
 * for a live order, and polling its settlement status as a fallback when
 * /ws/order/:quoteId isn't available. Self-execution quotes (gasless:
 * false) never touch this service - the wallet broadcasts `quote.tx`
 * itself.
 */
export class OrderService {
  constructor(private readonly client: ApiClient) {}

  async submitOrder(quoteId: string, signature: string, token: string): Promise<OrderResponse> {
    return this.client.post<OrderResponse>(
      '/api/order',
      { quoteId, signature },
      { headers: ApiClient.withBearerToken(token) }
    );
  }

  async getStatus(quoteId: string, token: string): Promise<OrderStatusUpdate> {
    return this.client.get<OrderStatusUpdate>(`/api/order/${encodeURIComponent(quoteId)}/status`, {
      headers: ApiClient.withBearerToken(token),
    });
  }
}

export const createOrderService = (client: ApiClient) => new OrderService(client);
