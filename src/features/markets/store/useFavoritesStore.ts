import { createPersistedStore } from '../../../core/storage';

interface FavoritesState {
  /** Token contract addresses (checksummed, as returned by /api/tokens). */
  favorites: string[];
  has: (address: string) => boolean;
  toggle: (address: string) => void;
}

export const useFavoritesStore = createPersistedStore<FavoritesState>('favorites', (set, get) => ({
  favorites: [],
  has: (address) => get().favorites.includes(address),
  toggle: (address) =>
    set((state) => ({
      favorites: state.favorites.includes(address)
        ? state.favorites.filter((a) => a !== address)
        : [...state.favorites, address],
    })),
}));
