import { useEffect, useRef } from 'react';

import { useToast } from '../components/common/Toast';
import { useFavoritesStore } from '../store/favoritesStore';
import { useNewsStore } from '../store/newsStore';
import { newsForToken } from '../utils/newsFilter';
import { filterTradeableNews } from '../utils/tradeableNews';
import { useTradeableNewsIndex } from './useTradeableNewsIndex';

/**
 * Subscribes to the news store and surfaces a toast for *new* breaking items
 * that match the user's watchlist. We only fire for items newer than the
 * timestamp captured when the hook mounted, so hydration on cold start does
 * not spam the user. Mount once at the app root.
 *
 * The toast currently has no tap-to-open action; the in-app reader is one tap
 * away in the News tab, and we deliberately do NOT yank the user out of any
 * in-flight trade flow.
 */
export function useBreakingNewsToast(): void {
  const toast = useToast();
  const index = useTradeableNewsIndex();
  const lastSeenRef = useRef<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const unsub = useNewsStore.subscribe((state, prev) => {
      if (state.items === prev.items || !index) return;
      const watchlist = useFavoritesStore.getState().favorites;
      if (watchlist.length === 0) return;

      const tradeable = filterTradeableNews(state.items, index);
      const matches = newsForToken(tradeable, { aliases: watchlist }).filter(
        (it) => it.importance === 3 && it.publishedAt > lastSeenRef.current
      );
      if (matches.length === 0) return;

      const latest = matches[0];
      lastSeenRef.current = Math.max(lastSeenRef.current, latest.publishedAt);
      toast.warning(`BREAKING · ${latest.title}`);
    });
    return () => unsub();
  }, [toast, index]);
}
