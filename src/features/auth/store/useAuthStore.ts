import { createEphemeralStore } from '../../../core/storage';
import { AuthSession } from '../types';

type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

interface AuthState {
  session: AuthSession | null;
  status: AuthStatus;
  setSession: (session: AuthSession) => void;
  clear: () => void;
  setStatus: (status: AuthStatus) => void;
}

/**
 * Deliberately NOT createPersistedStore: the token is the sensitive part of
 * this state and lives in SecureStore instead (see
 * core/storage/secureTokenStorage). This store just mirrors it in memory so
 * components can read it synchronously via a selector. useAuthBootstrap
 * repopulates it from SecureStore once on app start.
 */
export const useAuthStore = createEphemeralStore<AuthState>((set) => ({
  session: null,
  status: 'restoring',
  setSession: (session) => set({ session, status: 'authenticated' }),
  clear: () => set({ session: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
