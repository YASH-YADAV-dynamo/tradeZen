import type { BebopTx } from '../../api/types';
import { isPrivyConfigured } from '../../config/wallet';
import type { ConnectedWallet, WalletAdapter } from '../types';

export { isPrivyConfigured } from '../../config/wallet';

/**
 * Sets the active Privy wallet bridge. Wired from PrivyWalletBridge once the
 * SDK provider is mounted.
 */
let bridge: PrivyBridge | null = null;

export interface PrivyBridge {
  isReady(): boolean;
  getAddress(): string | null;
  connect(): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<string>;
  signTypedData(typedData: Record<string, unknown>): Promise<string>;
  sendTransaction(tx: BebopTx): Promise<string>;
}

export const setPrivyBridge = (next: PrivyBridge | null): void => {
  bridge = next;
};

export const privyAdapter: WalletAdapter = {
  id: 'privy',

  isAvailable() {
    return isPrivyConfigured();
  },

  async connect(): Promise<ConnectedWallet> {
    if (!bridge) {
      throw new Error(
        'Privy is not ready yet. Ensure EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID are set.'
      );
    }
    if (!bridge.isReady()) {
      throw new Error('Privy is still initializing. Try again in a moment.');
    }
    return bridge.connect();
  },

  async disconnect(): Promise<void> {
    await bridge?.disconnect();
  },

  async signMessage(address: string, message: string): Promise<string> {
    if (!bridge) throw new Error('Privy not initialized');
    return bridge.signMessage(message);
  },

  async signTypedData(address: string, typedData: Record<string, unknown>): Promise<string> {
    if (!bridge) throw new Error('Privy not initialized');
    return bridge.signTypedData(typedData);
  },

  async sendTransaction(tx: BebopTx): Promise<string> {
    if (!bridge) throw new Error('Privy not initialized');
    return bridge.sendTransaction(tx);
  },
};
