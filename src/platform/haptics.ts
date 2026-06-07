import { IS_NATIVE } from './index';

/**
 * Lightweight haptics wrapper. No-ops on web.
 * Uses lazy require to avoid loading expo-haptics on web bundles.
 */

type HapticsModule = typeof import('expo-haptics');

let cached: HapticsModule | null = null;

const load = (): HapticsModule | null => {
  if (!IS_NATIVE) return null;
  if (cached) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    cached = require('expo-haptics') as HapticsModule;
    return cached;
  } catch {
    return null;
  }
};

export const impact = (style: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  const m = load();
  if (!m) return;
  const map = {
    light: m.ImpactFeedbackStyle.Light,
    medium: m.ImpactFeedbackStyle.Medium,
    heavy: m.ImpactFeedbackStyle.Heavy,
  } as const;
  void m.impactAsync(map[style]);
};

export const selection = (): void => {
  const m = load();
  if (!m) return;
  void m.selectionAsync();
};

export const notify = (type: 'success' | 'error' | 'warning' = 'success'): void => {
  const m = load();
  if (!m) return;
  const map = {
    success: m.NotificationFeedbackType.Success,
    error: m.NotificationFeedbackType.Error,
    warning: m.NotificationFeedbackType.Warning,
  } as const;
  void m.notificationAsync(map[type]);
};
