import type { WalletChain } from '../store/walletStore';

/** EVM chains supported by the Go backend / Bebop integration. */
export const SUPPORTED_CHAINS: WalletChain[] = [
  'ethereum',
  'arbitrum',
  'base',
  'polygon',
  'bsc',
  'optimism',
  'avalanche',
];
