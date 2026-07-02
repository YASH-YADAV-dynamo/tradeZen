import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '../api';
import { secureTokenStorage } from '../../../core/storage';
import { decodeJwtPayload } from '../utils/jwt';
import { WalletSigner } from '../utils/walletSigner';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Runs the full login flow from the integration guide (§4.1) as a single
 * mutation: request a nonce, have the wallet sign it, trade the signature
 * for a JWT, then persist + hydrate the session. Callers get `isPending` /
 * `error` / `mutate` for free instead of juggling three loading flags.
 */
export const useLogin = (signer: WalletSigner) => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (wallet: string) => {
      const { nonce } = await authService.requestNonce(wallet);
      const signature = await signer.signMessage(nonce);
      const { token } = await authService.verify(wallet, signature);

      const payload = decodeJwtPayload(token);
      if (!payload) throw new Error('Received an unparseable session token.');

      await secureTokenStorage.set(token);
      return { wallet: payload.wallet, token, expiresAt: payload.exp };
    },
    onSuccess: (session) => setSession(session),
  });
};

export const useLogout = () => {
  const clear = useAuthStore((state) => state.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await secureTokenStorage.clear();
    },
    onSuccess: () => {
      clear();
      // Every JWT-gated query (portfolio, order status, ...) is stale now.
      void queryClient.invalidateQueries({
        predicate: (query) => query.meta?.requiresAuth === true,
      });
    },
  });
};
