import { ApiClient } from '../../../core/api';
import { Chain, PriceSnapshot } from '../types';

/**
 * Owns the REST price snapshot. This is deliberately the *fallback* path —
 * useLivePrices treats /ws/prices as the primary source and only leans on
 * this for the initial seed and for polling if the socket goes quiet.
 */
export class PricesService {
  constructor(private readonly client: ApiClient) {}

  async getSnapshot(chain: Chain): Promise<PriceSnapshot> {
    return this.client.get<PriceSnapshot>(`/api/prices?chain=${encodeURIComponent(chain)}`);
  }
}

export const createPricesService = (client: ApiClient) => new PricesService(client);
