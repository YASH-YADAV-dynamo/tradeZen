import * as SecureStore from 'expo-secure-store';

import { env } from '../config/env';

const TOKEN_KEY = env.tokenStorageKey;

/**
 * The JWT is the one piece of app state that deliberately does NOT go
 * through core/storage/createPersistedStore (which is backed by
 * AsyncStorage). Auth tokens get SecureStore, which is backed by Keychain
 * on iOS and Keystore-encrypted prefs on Android.
 */
export const secureTokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
