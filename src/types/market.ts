/** UI model for the markets list — composed from Token + live WS price. */
export interface MarketPair {
  address: string;
  symbol: string;
  name: string;
  logo: string;
  chain: string;
  decimals: number;
  canBuy: boolean;
  canSell: boolean;
  price?: number;
  isTradingHalted: boolean;
}
