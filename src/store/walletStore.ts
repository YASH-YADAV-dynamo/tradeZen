import { create } from 'zustand';
import { WalletChain } from '../types';

interface WalletState {
  address: string | null;
  balance: number | null;
  chain: WalletChain;
  setAddress: (address: string | null) => void;
  setBalance: (balance: number | null) => void;
  setChain: (chain: WalletState['chain']) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: null,
  chain: 'Ethereum',
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setChain: (chain) => set({ chain }),
}));
