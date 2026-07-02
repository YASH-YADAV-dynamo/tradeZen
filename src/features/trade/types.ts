import { Chain } from '../markets/types';

export interface QuoteRequest {
  chain: Chain;
  sellToken: string;
  buyToken: string;
  /** Base units (wei), as a decimal string. */
  sellAmount: string;
  takerAddress: string;
  /** Omit to use the server default (gasless). */
  gasless?: boolean;
}

export interface QuoteTokenAmount {
  amount: string;
  decimals: number;
  priceUsd: number;
  symbol: string;
  minimumAmount: string;
  amountBeforeFee: string;
}

export type QuoteStatus = 'QUOTE_SUCCESS' | 'SIG_SUCCESS';

export interface EIP712ToSign {
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
}

export interface SelfExecutionTx {
  to: string;
  value: string;
  data: string;
  from: string;
  gas: string;
  gasPrice: string;
}

export interface Quote {
  quoteId: string;
  status: QuoteStatus;
  gasless: boolean;
  expiresAt: number;
  chainId: number;
  buyTokens: Record<string, QuoteTokenAmount>;
  sellTokens: Record<string, QuoteTokenAmount>;
  /** Present when gasless: true - sign this (EIP-712) and POST /api/order. */
  toSign?: EIP712ToSign;
  /** Present when gasless: false - broadcast this yourself; no /api/order call. */
  tx?: SelfExecutionTx;
  settlementAddress: string;
  onchainOrderType: string;
  priceImpact: number;
  feeBps: number;
  feeTier: 'explorer' | 'trader' | 'pro';
}

export interface OrderResponse {
  orderId: string;
  status: string;
  txHash: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  txHash: string;
  amounts: unknown[];
}

export const TERMINAL_ORDER_STATUSES = new Set(['Settled', 'Confirmed', 'Failed']);
