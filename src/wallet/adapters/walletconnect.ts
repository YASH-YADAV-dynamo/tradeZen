import type { BebopTx } from '../../api/types';
import type { ConnectedWallet, WalletAdapter } from '../types';

/**
 * WalletConnect on native is handled through Privy's login modal when
 * EXPO_PUBLIC_PRIVY_APP_ID is set. A standalone WC SDK would require a
 * dev build + Reown AppKit — use Privy for mobile external wallets.
 */
export const walletConnectAdapter: WalletAdapter = {
  id: 'walletconnect',
  isAvailable() {
    return false;
  },
  async connect(): Promise<ConnectedWallet> {
    throw new Error('Use Privy on mobile for WalletConnect. Set EXPO_PUBLIC_PRIVY_APP_ID.');
  },
  async disconnect(): Promise<void> {
    /* noop */
  },
  async signMessage(): Promise<string> {
    throw new Error('WalletConnect unavailable on native');
  },
  async signTypedData(): Promise<string> {
    throw new Error('WalletConnect unavailable on native');
  },
  async sendTransaction(_tx: BebopTx): Promise<string> {
    throw new Error('WalletConnect unavailable on native');
  },
};
