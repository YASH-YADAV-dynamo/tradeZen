import { Asset } from 'expo-asset';

import { IS_NATIVE, IS_WEB } from './index';

/**
 * Cross-platform sound effects.
 * - Native: lazy-loads expo-audio players, reuses them
 * - Web: uses HTMLAudioElement
 *
 * Sounds are resolved from the JS bundle via require() once.
 * Use these methods imperatively; do NOT instantiate per-component.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const SOUND_SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  select: require('../../assets/sounds/select.wav'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
} as const;
/* eslint-enable @typescript-eslint/no-require-imports */

export type SoundName = keyof typeof SOUND_SOURCES;

type NativePlayer = { seekTo: (t: number) => void; play: () => void };

const nativePlayers: Partial<Record<SoundName, NativePlayer>> = {};
const webAudios: Partial<Record<SoundName, HTMLAudioElement>> = {};
let initialized = false;

const initWeb = () => {
  if (!IS_WEB || initialized) return;
  initialized = true;
  (Object.keys(SOUND_SOURCES) as SoundName[]).forEach((name) => {
    try {
      const asset = Asset.fromModule(SOUND_SOURCES[name]);
      const uri = asset.uri ?? asset.localUri;
      if (!uri) return;
      const audio = new Audio(uri);
      audio.preload = 'auto';
      audio.volume = 0.5;
      webAudios[name] = audio;
    } catch {
      // Audio failures should not break the app.
    }
  });
};

const initNative = async () => {
  if (!IS_NATIVE || initialized) return;
  initialized = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const expoAudio = require('expo-audio') as typeof import('expo-audio');
    await expoAudio.setAudioModeAsync({ playsInSilentMode: true });
    (Object.keys(SOUND_SOURCES) as SoundName[]).forEach((name) => {
      nativePlayers[name] = expoAudio.createAudioPlayer(SOUND_SOURCES[name]);
    });
  } catch {
    // expo-audio may not be available; sounds are non-critical.
  }
};

export const initSounds = (): void => {
  if (IS_WEB) initWeb();
  else void initNative();
};

export const playSound = (name: SoundName): void => {
  if (IS_WEB) {
    const a = webAudios[name];
    if (!a) return;
    try {
      a.currentTime = 0;
      void a.play();
    } catch {
      // Some browsers block autoplay; ignore silently.
    }
    return;
  }
  const p = nativePlayers[name];
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {
    // Ignore audio playback failures.
  }
};
