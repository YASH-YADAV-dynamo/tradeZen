import { useEffect } from 'react';

import { secureTokenStorage } from '../../../core/storage';
import { decodeJwtPayload, isSessionExpired } from '../utils';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Mount once near the app root (see AppProviders). Reads whatever token
 * SecureStore has, validates its expiry client-side, and either restores
 * the session or clears the stale token — so a user who logged in
 * yesterday doesn't have to reconnect their wallet every cold start.
 */
export const useAuthBootstrap = (): void => {
  const setSession = useAuthStore((state) => state.setSession);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await secureTokenStorage.get();
      const payload = token ? decodeJwtPayload(token) : null;

      if (cancelled) return;

      if (token && payload && !isSessionExpired({ expiresAt: payload.exp })) {
        setSession({ wallet: payload.wallet, token, expiresAt: payload.exp });
      } else {
        if (token) void secureTokenStorage.clear();
        clear();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clear, setSession]);
};
