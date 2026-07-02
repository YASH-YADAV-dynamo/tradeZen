import { ApiClient } from '../../../core/api';
import { env } from '../../../core/config/env';
import { Chain } from '../../markets/types';
import { PortfolioSnapshot } from '../types';

/**
 * Note: wallet is NOT sent as a query param — the backend derives it from
 * the JWT and returns 403 `wallet mismatch` if you pass a conflicting one,
 * so this deliberately never accepts a wallet argument.
 */
export class PortfolioService {
  constructor(private readonly client: ApiClient) {}

  async getPortfolio(chain: Chain, token: string, size = env.portfolioPageSize): Promise<PortfolioSnapshot> {
    return this.client.get<PortfolioSnapshot>(
      `/api/portfolio?chain=${encodeURIComponent(chain)}&size=${size}`,
      { headers: ApiClient.withBearerToken(token) }
    );
  }
}

export const createPortfolioService = (client: ApiClient) => new PortfolioService(client);
