import { useQuery } from '@tanstack/react-query';

import { portfolioService } from '../api';
import { Chain } from '../../markets/types';
import { PortfolioSnapshot } from '../types';

export const usePortfolio = (chain: Chain, token: string | undefined) =>
  useQuery<PortfolioSnapshot>({
    queryKey: ['portfolio', chain],
    queryFn: () => portfolioService.getPortfolio(chain, token!),
    enabled: Boolean(token),
    meta: { requiresAuth: true },
  });
