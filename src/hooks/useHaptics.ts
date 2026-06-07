import { useCallback } from 'react';

import { impact, notify } from '../platform/haptics';
import { playSound } from '../platform/sounds';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Unified haptic + sound feedback hook.
 * - Pure no-op on web (or when user disabled in Settings)
 * - Zero re-renders: only reads single boolean from store
 * - No heavy module init per component
 */
export const useHaptics = () => {
  const enabled = useSettingsStore((state) => state.hapticsEnabled);

  const onTap = useCallback(() => {
    if (!enabled) return;
    playSound('tap');
    impact('heavy');
  }, [enabled]);

  const onSelect = useCallback(() => {
    if (!enabled) return;
    playSound('select');
    impact('medium');
  }, [enabled]);

  const onSuccess = useCallback(() => {
    if (!enabled) return;
    playSound('success');
    notify('success');
  }, [enabled]);

  const onError = useCallback(() => {
    if (!enabled) return;
    playSound('error');
    notify('error');
  }, [enabled]);

  return { onTap, onSelect, onSuccess, onError };
};
