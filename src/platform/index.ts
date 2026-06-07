import { Platform } from 'react-native';

/**
 * Centralized platform capability flags.
 * Use these instead of scattered Platform.OS checks across the codebase.
 */

export const IS_WEB = Platform.OS === 'web';
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_NATIVE = IS_IOS || IS_ANDROID;

export const PLATFORM_CAPS = {
  haptics: IS_NATIVE,
  audio: IS_NATIVE,
  blur: IS_NATIVE,
  layoutAnimations: IS_NATIVE,
  windowEthereum: IS_WEB,
} as const;

/**
 * Pick a value per platform with a fallback.
 *
 * @example
 *   const ws = pickPlatform({ web: 'http://localhost', native: 'http://10.0.2.2' });
 */
export function pickPlatform<T>(values: { web?: T; ios?: T; android?: T; native?: T; default: T }): T {
  if (IS_WEB && values.web !== undefined) return values.web;
  if (IS_IOS && values.ios !== undefined) return values.ios;
  if (IS_ANDROID && values.android !== undefined) return values.android;
  if (IS_NATIVE && values.native !== undefined) return values.native;
  return values.default;
}
