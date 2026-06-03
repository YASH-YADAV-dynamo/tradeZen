import { useCallback, useEffect } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../store/settingsStore';

export const useHaptics = () => {
  const enabled = useSettingsStore((state) => state.hapticsEnabled);
  const tapPlayer = useAudioPlayer(require('../../assets/sounds/tap.wav'));
  const selectPlayer = useAudioPlayer(require('../../assets/sounds/select.wav'));
  const successPlayer = useAudioPlayer(require('../../assets/sounds/success.wav'));
  const errorPlayer = useAudioPlayer(require('../../assets/sounds/error.wav'));

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

  const onSuccess = useCallback(() => {
    if (!enabled) return;
    play(successPlayer);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled, play, successPlayer]);

  const onError = useCallback(() => {
    if (!enabled) return;
    play(errorPlayer);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [enabled, errorPlayer, play]);

  return { onTap, onSelect, onSuccess, onError };
};
