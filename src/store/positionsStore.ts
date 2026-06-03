import { create } from 'zustand';
import { Position } from '../types';

interface PositionsState {
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  closePosition: (id: string, exitPrice: number) => void;
}

export const usePositionsStore = create<PositionsState>((set) => ({
  positions: [],
  setPositions: (positions) => set({ positions }),
  addPosition: (position) =>
    set((state) => ({ positions: [position, ...state.positions] })),
  closePosition: (id, exitPrice) =>
    set((state) => ({
      positions: state.positions.map((position) =>
        position.id === id
          ? { ...position, exitPrice, closedAt: new Date().toISOString() }
          : position
      ),
    })),
}));
