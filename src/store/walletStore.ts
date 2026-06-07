import { create } from 'zustand';

import type { ChainSlug } from '../api/types';

export type WalletChain = ChainSlug;

interface WalletState {
  address: string | null;
  chain: WalletChain;
  jwt: string | null;
  setWallet: (address: string, chain?: WalletChain) => void;
  setAddress: (address: string | null) => void;
  setChain: (chain: WalletChain) => void;
  setJwt: (jwt: string) => void;
  clearJwt: () => void;
  disconnect: () => void;
  logout: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chain: 'ethereum',
  jwt: null,
  setWallet: (address, chain) =>
    set((s) => ({ address, chain: chain ?? s.chain })),
  setAddress: (address) => set({ address }),
  setChain: (chain) => set({ chain }),
  setJwt: (jwt) => set({ jwt }),
  clearJwt: () => set({ jwt: null }),
  disconnect: () => set({ address: null, jwt: null }),
  logout: () => set({ address: null, jwt: null }),
}));

/** Non-hook accessor for Axios interceptors and WS clients outside React. */
export const getWalletStore = () => useWalletStore.getState();

// Targeted selectors to avoid unnecessary re-renders.
export const useWalletAddress = () => useWalletStore((s) => s.address);
export const useWalletChain = () => useWalletStore((s) => s.chain);
export const useWalletJwt = () => useWalletStore((s) => s.jwt);
