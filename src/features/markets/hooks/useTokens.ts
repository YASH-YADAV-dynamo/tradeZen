import { useQuery } from '@tanstack/react-query';

import { tokensService } from '../api';
import { Chain, Token } from '../types';

export const useTokens = (chain: Chain) =>
  useQuery<Token[]>({
    queryKey: ['tokens', chain],
    queryFn: () => tokensService.getTokens(chain),
    // The backend caches this for 24h server-side; no point refetching sooner.
    staleTime: 24 * 60 * 60 * 1000,
  });
