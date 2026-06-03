import { create } from 'zustand';
import { MarketPair } from '../types';

interface TradePanelState {
  selectedPair?: MarketPair;
  isOpen: boolean;
  openTradeModal: (pair: MarketPair) => void;
  closeTradeModal: () => void;
}

export const useTradePanelStore = create<TradePanelState>((set) => ({
  selectedPair: undefined,
  isOpen: false,
  openTradeModal: (pair) => set({ selectedPair: pair, isOpen: true }),
  closeTradeModal: () => set({ isOpen: false }),
}));
