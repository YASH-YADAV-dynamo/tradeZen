import { ApiClient } from '../../../core/api';
import { Quote, QuoteRequest } from '../types';

/**
 * Requests an RFQ swap quote. Never send fee/source/origin_address fields —
 * per the integration guide, the server injects those itself.
 */
export class QuoteService {
  constructor(private readonly client: ApiClient) {}

  async createQuote(request: QuoteRequest, token: string): Promise<Quote> {
    return this.client.post<Quote>('/api/quote', request, {
      headers: ApiClient.withBearerToken(token),
    });
  }
}

export const createQuoteService = (client: ApiClient) => new QuoteService(client);
