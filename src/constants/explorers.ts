import type { WalletChain } from '../store/walletStore';

/** Block explorer base URLs for transaction links, keyed by Bebop chain slug. */
export const TX_EXPLORERS: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  base: 'https://basescan.org/tx/',
  polygon: 'https://polygonscan.com/tx/',
  bsc: 'https://bscscan.com/tx/',
  optimism: 'https://optimistic.etherscan.io/tx/',
  avalanche: 'https://snowtrace.io/tx/',
};

export const txExplorerUrl = (chain: WalletChain, txHash: string): string => {
  const base = TX_EXPLORERS[chain] ?? TX_EXPLORERS.ethereum;
  return `${base}${txHash}`;
};
