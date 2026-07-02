export type NewsAssetType = 'crypto' | 'stock' | 'etf' | 'macro';
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: number;
  source: string;
  assetType: NewsAssetType;
  relatedSymbols: string[];
  sentiment: NewsSentiment;
  importance: number;
  imageUrl: string | null;
}

export interface NewsQuery {
  limit?: number;
  since?: number;
  symbol?: string;
  type?: NewsAssetType;
}
