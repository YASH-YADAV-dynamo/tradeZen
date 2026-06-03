export type TradeDirection = 'long' | 'short';
export type AssetType = 'stock' | 'etf';
export type WalletChain = 'Ethereum' | 'Mantle' | 'Solana';
export type XChangeSide = 'Buy' | 'Sell';

export interface XStockAsset {
  symbol: string;
  name: string;
  underlyingSymbol: string;
  logo: string;
  type: AssetType;
  isTradingHalted: boolean;
  networks: string[];
  supportsAtomicSwaps: boolean;
}

export interface MarketPair {
  symbol: string;
  base: string;
  name: string;
  logo: string;
  assetType: AssetType;
  price?: number;
  isTradingHalted: boolean;
  networks: string[];
  supportsAtomicSwaps: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  direction: TradeDirection;
  entryPrice: number;
  size: number;
  leverage: number;
  openedAt: string;
  closedAt?: string;
  exitPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface XChangeNetwork {
  network: string;
  tokenAddress: string | null;
  contractAddress: string | null;
  isEnabled: boolean;
}

export interface XChangeAssetConfig {
  id: string;
  symbol: string;
  maxOrderFiatValue: number;
  minOrderFiatValue: number | null;
  currency: string;
  quoteValiditySeconds: number;
  executionTimeoutSeconds: number;
  tradingHoursMode: 'MarketHours' | 'TwentyFourFive' | 'Always';
  isTradingHalted: boolean;
  canQuote: boolean;
  bid: number | null;
  ask: number | null;
  limitsPerPeriod?: {
    currentPeriod?: string;
  };
  networks: XChangeNetwork[];
}

export interface XChangeQuoteRequest {
  identifier: string;
  side: XChangeSide;
  quantity?: number | string;
  cashAmount?: number | string;
  network: string;
  paymentWalletIdentifier: string;
  receivingWalletIdentifier: string;
}

export interface XChangeQuote {
  id: string;
  quantity?: number | string;
  price?: number;
  generalStatus?: 'Provided' | 'Accepted' | 'Completed' | 'Expired' | 'Cancelled';
  hedgingStatus?:
    | 'NotStarted'
    | 'PendingHedge'
    | 'InProgress'
    | 'Succeeded'
    | 'Failed'
    | 'Unwinding'
    | 'Unwound';
  blockchainStatus?:
    | 'NotReady'
    | 'GeneratingSignature'
    | 'PendingExecution'
    | 'Executed'
    | 'ExpiredExecution'
    | 'Failed';
  createdAt?: string;
  side?: XChangeSide;
  tokenDeployment?: {
    decimals?: number | null;
    address?: string | null;
    chainId?: number | string;
    network?: string;
    token?: {
      symbol?: string;
      name?: string;
    };
  };
  contract?: {
    network?: string;
    address?: string;
  } | null;
  signature?: string | null;
  signaturePayload?: unknown;
}
