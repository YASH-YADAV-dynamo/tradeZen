import { useEffect } from 'react';

import { useNewsHydration } from '../api/hooks/useNews';
import { useWalletJwt } from '../store/walletStore';
import { connectNewsStream } from '../ws/newsStream';

/**
 * Single boot-point for the news subsystem. Mount once at the app root.
 *
 * Strategy (matches v2.4 backend recommendation):
 *   1. REST: `GET /api/news?limit=50` on mount + on focus (handles cold start
 *      and reconnect-after-background).
 *   2. SSE:  one `/sse/news?all=true` stream per JWT — covers every screen,
 *      every symbol. Closes/reopens automatically when JWT changes.
 *
 * Views consume via `useFilteredNews()` / `useNewsForToken()`. No additional
 * REST or SSE calls are needed downstream.
 */
export function useNewsFeed(): { isLoading: boolean; isError: boolean } {
  const jwt = useWalletJwt();
  const hydration = useNewsHydration();

  useEffect(() => {
    if (!jwt) return;
    const close = connectNewsStream({ jwt, all: true });
    return () => close();
  }, [jwt]);

  return hydration;
}
