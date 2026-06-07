import type { BebopTx } from '../../api/types';
import type { ConnectedWallet, WalletAdapter } from '../types';

/**
 * Native (iOS/Android) fallback for the "injected" adapter slot.
 * Browser wallet injection doesn't exist on RN — this stub keeps the
 * import graph consistent and reports itself as unavailable so the
 * wallet provider falls through to Privy or the manual adapter.
 */
export const injectedAdapter: WalletAdapter = {
  id: 'web-injected',
  isAvailable() {
    return false;
  },
  async connect(): Promise<ConnectedWallet> {
    throw new Error('Injected wallets are only available on web.');
  },
  async disconnect(): Promise<void> {
    /* noop */
  },
  async signMessage(): Promise<string> {
    throw new Error('Injected wallets are only available on web.');
  },
  async signTypedData(): Promise<string> {
    throw new Error('Injected wallets are only available on web.');
  },
  async sendTransaction(_tx: BebopTx): Promise<string> {
    throw new Error('Injected wallets are only available on web.');
  },
};

export const subscribeToProviderEvents = (
  _onAccountsChanged: (accounts: string[]) => void,
  _onChainChanged: (chainId: string) => void
): (() => void) => () => undefined;
