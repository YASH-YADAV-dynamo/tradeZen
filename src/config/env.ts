/**
 * Environment configuration — a single, typed accessor for every
 * EXPO_PUBLIC_* variable. Components never read process.env directly.
 *
 * Defaults are chosen so production builds behave correctly with an
 * empty .env (no leaks of dev-only UI to real users).
 */

const flag = (raw: string | undefined, fallback = false): boolean => {
  if (raw == null) return fallback;
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
};

/** True when EXPO_PUBLIC_DEV_MODE=true. Gates manual adapter, error stacks, etc. */
export const IS_DEV_MODE: boolean = flag(process.env.EXPO_PUBLIC_DEV_MODE, false);

/** True when EXPO_PUBLIC_VERBOSE_ERRORS=true OR dev mode is on. */
export const SHOW_VERBOSE_ERRORS: boolean =
  flag(process.env.EXPO_PUBLIC_VERBOSE_ERRORS, false) || IS_DEV_MODE;

export const PRIVY_APP_ID: string = process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? '';
export const PRIVY_CLIENT_ID: string = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? '';

export const CONFIG = {
  isDevMode: IS_DEV_MODE,
  showVerboseErrors: SHOW_VERBOSE_ERRORS,
  privy: { appId: PRIVY_APP_ID, clientId: PRIVY_CLIENT_ID },
} as const;

/** Sanitize an error for end-user display. In dev mode pass through verbatim. */
export const friendlyError = (err: unknown, fallback = 'Something went wrong'): string => {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : fallback;
  if (SHOW_VERBOSE_ERRORS) return raw;
  // Strip internal-looking strings users shouldn't see.
  if (/network|timeout|fetch|ENOTFOUND/i.test(raw)) {
    return 'Network unavailable. Please try again.';
  }
  if (/jwt|token/i.test(raw)) return 'Session expired. Please reconnect.';
  if (/signature|sign/i.test(raw)) return 'Signature was rejected.';
  if (/rate limit/i.test(raw)) return 'Too many requests. Please wait a moment.';
  if (/expired/i.test(raw)) return 'Quote expired. Refresh to get a new price.';
  // Bebop verbatim errors like "InsufficientLiquidity" are still useful — keep them.
  if (/insufficient|liquidity|min ?size|notional/i.test(raw)) return raw;
  return raw.length > 120 ? fallback : raw;
};
