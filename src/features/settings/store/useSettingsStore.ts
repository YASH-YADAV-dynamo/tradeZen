import { createPersistedStore } from '../../../core/storage';

interface SettingsState {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = createPersistedStore<SettingsState>('settings', (set) => ({
  hapticsEnabled: true,
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
}));
