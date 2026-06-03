import { create } from 'zustand';

interface FavoritesState {
  favorites: string[];
  has: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: ['AAPLx', 'NVDAx'],
  has: (symbol) => get().favorites.includes(symbol),
  toggle: (symbol) =>
    set((state) => ({
      favorites: state.favorites.includes(symbol)
        ? state.favorites.filter((s) => s !== symbol)
        : [...state.favorites, symbol],
    })),
}));
