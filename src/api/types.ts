// API contracts — keep in sync with the Go backend integration guide v2.4.

export type ApiError = {
  error: string;
};

export type FeeTier = 'explorer' | 'trader' | 'pro';

export type ChainSlug =
  | 'ethereum'
  | 'arbitrum'
  | 'polygon'
  | 'base'
  | 'bsc'
  | 'optimism'
  | 'avalanche'
  | string;

export type NonceResponse = {
  nonce: string;
};

export type VerifyRequest = {
  wallet: string;
  signature: string;
};

export type VerifyResponse = {
  token: string;
};

export type JWTPayload = {
  wallet: string;
  exp: number;
};

export type TokenAvailability = {
  isAvailable: boolean;
  canBuy: boolean;
  canSell: boolean;
};

export type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  extensions: {
    availability: TokenAvailability;
  };
};

export type QuoteRequest = {
  chain: ChainSlug;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  takerAddress: string;
  /** Omit to use server default (BEBOP_GASLESS env, true by default). */
  gasless?: boolean;
};

export type QuoteStatus = 'QUOTE_SUCCESS' | 'SIG_SUCCESS' | string;

/** Transaction payload returned when `gasless === false` (self-execution mode). */
export type BebopTx = {
  to: string;
  value: string;
  data: string;
  from: string;
  gas: number;
  gasPrice: number;
};

export type TokenAmount = {
  amount: string;
  decimals: number;
  priceUsd: number;
  symbol: string;
  minimumAmount?: string;
  amountBeforeFee?: string;
};

export type ToSign = {
  partner_id: number;
  expiry: number;
  taker_address: string;
  maker_address: string;
  maker_nonce: string;
  taker_token: string;
  maker_token: string;
  taker_amount: string;
  maker_amount: string;
  receiver: string;
  packed_commands: string;
};

export type QuoteResponse = {
  quoteId: string;
  /** Bebop status — QUOTE_SUCCESS for gasless, SIG_SUCCESS for self-execution. */
  status: QuoteStatus;
  /** True when toSign is returned and POST /api/order is required. */
  gasless: boolean;
  expiresAt: number;
  chainId: number;
  buyTokens: Record<string, TokenAmount>;
  sellTokens: Record<string, TokenAmount>;
  /** Present when gasless === true. */
  toSign?: ToSign;
  /** Present when gasless === false (broadcast directly from wallet). */
  tx?: BebopTx;
  settlementAddress: string;
  onchainOrderType: string;
  priceImpact: number;
  feeBps: number;
  feeTier: FeeTier;
};

export type OrderRequest = {
  quoteId: string;
  signature: string;
};

export type OrderResponse = {
  orderId: string;
  status: string;
  txHash: string;
};

export type OrderAmount = {
  token: string;
  amount: string;
};

export type OrderStatus = {
  orderId: string;
  status: 'Pending' | 'Settled' | 'Confirmed' | 'Failed' | string;
  txHash: string;
  amounts?: OrderAmount[];
};

export type TradeTokenInfo = {
  amount: string;
  amountUsd: number;
  symbol: string;
};

export type Trade = {
  chain_id: number;
  txHash: string;
  status: string;
  type: string;
  taker: string;
  receiver: string;
  sellTokens: Record<string, TradeTokenInfo>;
  buyTokens: Record<string, TradeTokenInfo>;
  volumeUsd: number;
  gasFeeUsd: number;
  timestamp: string;
  route: string;
  gasless: boolean;
};

export type PortfolioSummary = {
  tradeCount: number;
  successfulTrades: number;
  totalVolumeUsd: number;
};

export type PortfolioResponse = {
  wallet: string;
  chain: string;
  trades: Trade[];
  summary: PortfolioSummary;
  markPrices: Record<string, number>;
};

// Provider tag — backend keeps a pluggable registry (alphavantage added in v2.4),
// so `source` is open-ended. Render unknown values as the raw string.
export type NewsSource =
  | 'cryptopanic'
  | 'benzinga'
  | 'alphavantage'
  | 'cryptocurrency.cv'
  | string;
export type NewsAssetType = 'crypto' | 'stock' | 'etf' | 'macro';
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';
export type NewsImportance = 1 | 2 | 3;

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: number;
  source: NewsSource;
  /** Outlet / publication name (e.g. "Reuters") when supplied by the provider. */
  publisher?: string;
  assetType: NewsAssetType;
  relatedSymbols: string[];
  sentiment: NewsSentiment;
  /** Raw provider score in [-1, 1] — Alpha Vantage and similar feeds. */
  sentimentScore?: number;
  importance: NewsImportance;
  imageUrl: string | null;
  tokenAddress?: string;
  tokenSymbol?: string;
};

export type NewsQueryParams = {
  symbol?: string;
  type?: NewsAssetType;
  limit?: number;
  since?: number;
};

/** Client-side filter shape — wires straight into filterNews(). */
export type NewsFilter = {
  symbols?: string[];
  assetTypes?: NewsAssetType[];
  sources?: NewsSource[];
  minImportance?: NewsImportance;
  sentiment?: NewsSentiment;
  minScore?: number;
  sinceTs?: number;
  search?: string;
};

export type SSEConnectedEvent = {
  message: string;
  items: NewsItem[];
};

export type SSEPingEvent = {
  ts: number;
};

export type PriceLevel = [price: number, size: number];

export type PriceBookEntry = {
  last_update_ts: number;
  bids: PriceLevel[];
  asks: PriceLevel[];
};

/** Raw Bebop order-book map keyed by "base/quote". */
export type PriceBookSnapshot = Record<string, PriceBookEntry>;

/** @deprecated Use PriceBookSnapshot. */
export type PriceSnapshot = PriceBookSnapshot;

/** Normalized backend snapshot returned by GET /api/prices and WS broadcasts. */
export type PricesResponse = {
  chain: string;
  updatedAt: number;
  prices: Record<string, number>;
  books?: PriceBookSnapshot;
};

/** Union of every shape parsePriceUpdate is expected to handle. */
export type PriceWSMessage =
  | PricesResponse
  | { prices: Record<string, number> }
  | Record<string, number>
  | PriceBookSnapshot;

export type HealthResponse = {
  status: 'ok';
};
