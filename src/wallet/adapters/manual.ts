import type { BebopTx } from '../../api/types';
import type { ConnectedWallet, WalletAdapter } from '../types';

/**
 * Dev-only manual address adapter. Lets a developer paste a wallet address
 * and produces a synthetic auth flow (the address is treated as "connected"
 * but cannot sign — every signature throws). Useful for prototyping screens
 * before Privy is wired in.
 */

let pendingAddress: string | null = null;

export const setManualAddress = (address: string | null): void => {
  pendingAddress = address;
};

export const manualAdapter: WalletAdapter = {
  id: 'manual',

  isAvailable() {
    return true;
  },

  async connect(): Promise<ConnectedWallet> {
    if (!pendingAddress) {
      throw new Error('Manual wallet requires an address before connect()');
    }
    return { address: pendingAddress, source: 'manual' };
  },

  async disconnect(): Promise<void> {
    pendingAddress = null;
  },

  async signMessage(): Promise<string> {
    throw new Error('This wallet cannot sign. Connect a real wallet to authenticate.');
  },

  async signTypedData(): Promise<string> {
    throw new Error('This wallet cannot sign typed data. Connect a real wallet to trade.');
  },

  async sendTransaction(_tx: BebopTx): Promise<string> {
    throw new Error('This wallet cannot broadcast transactions.');
  },
};
