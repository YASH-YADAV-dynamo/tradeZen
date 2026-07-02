import { ApiClient } from '../../../core/api';
import { env } from '../../../core/config/env';
import { NewsItem, NewsQuery } from '../types';

export class NewsService {
  constructor(private readonly client: ApiClient) {}

  async getNews(query: NewsQuery = {}): Promise<NewsItem[]> {
    const params = new URLSearchParams();
    params.set('limit', String(query.limit ?? env.newsPageSize));
    if (query.since) params.set('since', String(query.since));
    if (query.symbol) params.set('symbol', query.symbol);
    if (query.type) params.set('type', query.type);

    return this.client.get<NewsItem[]>(`/api/news?${params.toString()}`);
  }
}

export const createNewsService = (client: ApiClient) => new NewsService(client);
