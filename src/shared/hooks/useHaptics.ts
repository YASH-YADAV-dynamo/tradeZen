import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../../features/settings/store/useSettingsStore';

/**
 * Tap/select feedback used by pressable UI (Button, PairRow, the tab bar).
 * Only exposes the two feedback kinds actually triggered anywhere in the
 * app; add a new one here only once something calls it.
 */
export const useHaptics = () => {
  const enabled = useSettingsStore((state) => state.hapticsEnabled);
  const tapPlayer = useAudioPlayer(require('../../../assets/sounds/tap.wav'));
  const selectPlayer = useAudioPlayer(require('../../../assets/sounds/select.wav'));

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  const play = useCallback(
    (player: typeof tapPlayer) => {
      if (!enabled) return;
      try {
        player.seekTo(0);
        player.play();
      } catch {
        // Audio feedback should never block the primary UI action.
      }
    },
    [enabled]
  );

  const onTap = useCallback(() => {
    if (!enabled) return;
    play(tapPlayer);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      void Haptics.selectionAsync();
    }, 36);
  }, [enabled, play, tapPlayer]);

  const onSelect = useCallback(() => {
    if (!enabled) return;
    play(selectPlayer);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 42);
  }, [enabled, play, selectPlayer]);

  return { onTap, onSelect };
};
