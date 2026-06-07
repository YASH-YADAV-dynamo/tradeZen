import { useBreakingNewsToast } from '../../hooks/useBreakingNewsToast';
import { useNewsFeed } from '../../hooks/useNewsFeed';

/**
 * Headless component — mount once at the app root. Hydrates the news store
 * via REST, keeps the SSE stream alive for the full session, and pumps
 * watchlist breaking-news toasts.
 */
export function NewsBoot(): null {
  useNewsFeed();
  useBreakingNewsToast();
  return null;
}
