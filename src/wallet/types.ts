import type { BebopTx } from '../api/types';

/**
 * Connection state for the user's wallet.
 *
 *   idle         – no attempt yet, no connection
 *   connecting   – modal open / signature pending
 *   connected    – address available, can sign + transact
 *   error        – last connect attempt failed (see WalletAdapter.lastError)
 */
export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface ConnectedWallet {
  address: string;
  chainId?: number;
  /** Provider name for analytics / UI ("metamask", "privy-embedded", "privy-external", "manual"). */
  source: string;
}

/**
 * Adapter contract every wallet backend (Privy / window.ethereum / manual)
 * must implement. The UI never calls these directly — go through `useWallet()`.
 */
export interface WalletAdapter {
  readonly id: 'web-injected' | 'privy' | 'walletconnect' | 'manual';
  /** Is this adapter usable in the current runtime? */
  isAvailable(): boolean;
  /** Open a connect modal / request accounts. Resolves on success, rejects on cancel. */
  connect(): Promise<ConnectedWallet>;
  /** Disconnect and clear local credentials. */
  disconnect(): Promise<void>;
  /** Personal-sign (EIP-191) — used for wallet auth nonces. */
  signMessage(address: string, message: string): Promise<string>;
  /** Typed data sign (EIP-712) — used for gasless RFQ orders. */
  signTypedData(address: string, typedData: Record<string, unknown>): Promise<string>;
  /** Broadcast a raw transaction — used for self-execution quotes. */
  sendTransaction(tx: BebopTx): Promise<string>;
  /** Returns current chain id if available (for cross-checking against quote chainId). */
  getChainId?(): Promise<number | null>;
  /** Request the wallet to switch its active network. Optional. */
  switchChain?(chainId: number): Promise<void>;
}
