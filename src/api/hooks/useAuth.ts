import { useMutation, useQuery } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { NonceResponse, VerifyRequest, VerifyResponse } from '../types';
import { useWalletStore } from '../../store/walletStore';

export const useNonce = (wallet?: string | null) =>
  useQuery<NonceResponse>({
    queryKey: ['nonce', wallet],
    queryFn: async () => {
      const { data } = await api.get<NonceResponse>(apiPaths.nonce, {
        params: { wallet },
      });
      return data;
    },
    enabled: false,
  });

export const useVerify = () => {
  const setJwt = useWalletStore((s) => s.setJwt);
  const setWallet = useWalletStore((s) => s.setWallet);
  const chain = useWalletStore((s) => s.chain);

  return useMutation<VerifyResponse, Error, VerifyRequest>({
    mutationFn: async (body) => {
      const { data } = await api.post<VerifyResponse>(apiPaths.verify, body);
      return data;
    },
    onSuccess: (data, vars) => {
      setJwt(data.token);
      setWallet(vars.wallet, chain);
    },
  });
};
