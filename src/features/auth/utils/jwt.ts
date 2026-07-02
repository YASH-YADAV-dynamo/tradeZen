import { AuthSession } from '../types';

/**
 * Decodes a JWT's payload WITHOUT verifying its signature. This is only
 * ever used to read `exp`/`wallet` for client-side UX (e.g. "is my cached
 * session still fresh enough to skip login?"). The server re-validates the
 * token's signature on every protected request — this decode is never used
 * for authorization decisions.
 */
export const decodeJwtPayload = (token: string): { wallet: string; exp: number } | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    const parsed = JSON.parse(json);
    if (typeof parsed.wallet !== 'string' || typeof parsed.exp !== 'number') return null;
    return { wallet: parsed.wallet, exp: parsed.exp };
  } catch {
    return null;
  }
};

export const isSessionExpired = (session: Pick<AuthSession, 'expiresAt'>): boolean =>
  session.expiresAt * 1000 <= Date.now();
