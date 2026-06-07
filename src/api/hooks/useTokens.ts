import { useQuery } from '@tanstack/react-query';

import { api, apiPaths } from '../backend';
import type { Token } from '../types';
import { useWalletStore } from '../../store/walletStore';
import { toUIToken, type UIToken } from '../../utils/token';

export const useTokens = () => {
  const chain = useWalletStore((s) => s.chain);
  return useQuery<UIToken[]>({
    queryKey: ['tokens', chain],
    queryFn: async () => {
      const { data } = await api.get<Token[]>(apiPaths.tokens, { params: { chain } });
      if (!Array.isArray(data)) {
        throw new Error('Invalid tokens response from backend');
      }
      return data.map((token) => toUIToken(token, chain));
    },
    staleTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });
};
