import { create } from 'zustand';

interface SettingsState {
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
}));
