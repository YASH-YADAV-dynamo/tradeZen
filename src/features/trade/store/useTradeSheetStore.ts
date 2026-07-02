import { createEphemeralStore } from '../../../core/storage';
import { Token } from '../../markets/types';

interface TradeSheetState {
  buyToken?: Token;
  isOpen: boolean;
  open: (token: Token) => void;
  close: () => void;
}

export const useTradeSheetStore = createEphemeralStore<TradeSheetState>((set) => ({
  buyToken: undefined,
  isOpen: false,
  open: (token) => set({ buyToken: token, isOpen: true }),
  close: () => set({ isOpen: false }),
}));
