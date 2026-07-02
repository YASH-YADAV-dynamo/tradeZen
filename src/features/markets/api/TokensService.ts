import { ApiClient, ApiError } from '../../../core/api';
import { Chain, Token } from '../types';

/**
 * Owns the tradeable-token listing. The backend already filters to
 * `canBuy || canSell` and caches for 24h server-side, so this stays a thin
 * pass-through rather than re-implementing that filtering client-side.
 */
export class TokensService {
  constructor(private readonly client: ApiClient) {}

  async getTokens(chain: Chain): Promise<Token[]> {
    const data = await this.client.get<Token[] | { error: string }>(
      `/api/tokens?chain=${encodeURIComponent(chain)}`
    );

    if (Array.isArray(data)) return data;

    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
      throw new ApiError(data.error);
    }

    throw new ApiError('Unexpected tokens response from server');
  }
}

export const createTokensService = (client: ApiClient) => new TokensService(client);
