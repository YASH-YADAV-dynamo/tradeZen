import { createPersistedStore } from '../../../core/storage';
import { env } from '../../../core/config/env';
import { WalletChain } from '../../../shared/types';

interface WalletState {
  chain: WalletChain;
  setChain: (chain: WalletChain) => void;
}

/**
 * Wallet *address* is no longer stored here — that's now server-verified
 * session state owned by features/auth (see useAuthStore /
 * secureTokenStorage). This store just remembers the user's chosen chain
 * across restarts.
 */
export const useWalletStore = createPersistedStore<WalletState>('wallet', (set) => ({
  chain: env.defaultChain as WalletChain,
  setChain: (chain) => set({ chain }),
}));
