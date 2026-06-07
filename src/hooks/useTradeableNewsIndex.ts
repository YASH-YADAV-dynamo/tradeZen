import { useMemo } from 'react';

import { useTokens } from '../api/hooks';
import {
  buildTradeableNewsIndex,
  type TradeableNewsIndex,
} from '../utils/tradeableNews';

/**
 * Memoized symbol/address index from the current chain's tradeable tokens.
 * Returns null while the token list is still loading.
 */
export function useTradeableNewsIndex(): TradeableNewsIndex | null {
  const { data: tokens, isLoading } = useTokens();

  return useMemo(() => {
    if (isLoading || !tokens?.length) return null;
    return buildTradeableNewsIndex(tokens);
  }, [tokens, isLoading]);
}
