export type { WalletChain as Chain } from '../../shared/types';

export interface TokenAvailability {
  isAvailable: boolean;
  canBuy: boolean;
  canSell: boolean;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  extensions: { availability: TokenAvailability };
}

export interface PriceSnapshot {
  chain: string;
  updatedAt: number;
  /** Keyed by LOWERCASE token address - unlike Token.address, which is checksummed. */
  prices: Record<string, number>;
  books?: Record<string, unknown>;
}
