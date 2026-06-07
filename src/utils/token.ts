import type { Token } from '../api/types';

/** Token enriched with chain + flat availability flags for UI components. */
export type UIToken = Token & {
  chain: string;
  canBuy: boolean;
  canSell: boolean;
};

export const toUIToken = (token: Token, chain: string): UIToken => {
  const availability = token.extensions?.availability;
  return {
    ...token,
    chain,
    canBuy: availability?.canBuy ?? false,
    canSell: availability?.canSell ?? false,
  };
};
