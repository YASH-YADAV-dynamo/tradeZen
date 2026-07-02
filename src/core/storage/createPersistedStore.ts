import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

/**
 * Every "ecosystem-wide" piece of state (favorites, wallet, settings,
 * positions) is created through this factory so that:
 *  - it survives app restarts on iOS, Android, and web via the same
 *    AsyncStorage-backed adapter (web falls back to localStorage under the
 *    hood through RN Web's AsyncStorage shim), and
 *  - every store gets the same hydration/versioning behaviour instead of
 *    each store hand-rolling its own persistence logic.
 *
 * Usage:
 *   export const useFavoritesStore = createPersistedStore<FavoritesState>(
 *     'favorites',
 *     (set, get) => ({ ... })
 *   );
 */
export function createPersistedStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [], [], T>,
  options?: Partial<Omit<PersistOptions<T>, 'name' | 'storage'>>
) {
  return create<T>()(
    persist(initializer, {
      name: `tradezen:${name}`,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      ...options,
    })
  );
}

/**
 * For ephemeral, session-only UI state (e.g. a bottom sheet's open/closed
 * flag) that should never be written to disk. Using this instead of plain
 * zustand `create` keeps the intent explicit at the call site.
 */
export function createEphemeralStore<T extends object>(initializer: StateCreator<T, [], [], T>) {
  return create<T>()(initializer);
}
