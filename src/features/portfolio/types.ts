export interface Trade {
  txHash: string;
  status: string;
  volumeUsd: number;
  [key: string]: unknown;
}

export interface PortfolioSummary {
  tradeCount: number;
  successfulTrades: number;
  totalVolumeUsd: number;
}

export interface PortfolioSnapshot {
  wallet: string;
  chain: string;
  trades: Trade[];
  summary: PortfolioSummary;
  /** Keyed by lowercase token address, same convention as PriceSnapshot. */
  markPrices: Record<string, number>;
}
