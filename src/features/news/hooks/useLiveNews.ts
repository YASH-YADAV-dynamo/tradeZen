import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { EventStream, buildSseUrl } from '../../../core/realtime';
import { ApiClient } from '../../../core/api';
import { NewsItem } from '../types';
import { newsQueryKey } from './useNews';

const MAX_CACHED_ITEMS = 50;

const mergeNewsItem = (prev: NewsItem[], item: NewsItem): NewsItem[] => {
  if (prev.some((existing) => existing.id === item.id)) return prev;
  return [item, ...prev].slice(0, MAX_CACHED_ITEMS);
};

/**
 * Opens exactly one /sse/news?all=true stream (per the integration guide's
 * recommendation) and merges every pushed item into the same react-query
 * cache useNews reads from — so a screen just calls useNews() and gets
 * live updates for free, with no separate "live news" store to keep in
 * sync.
 */
export const useLiveNews = (token: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const stream = new EventStream(
      buildSseUrl('/sse/news', { all: 'true' }),
      ['connected', 'news'],
      {
        onEvent: (name, raw) => {
          if (!raw) return;
          try {
            if (name === 'connected') {
              const payload = JSON.parse(raw) as { items?: NewsItem[] };
              if (Array.isArray(payload.items)) {
                queryClient.setQueryData<NewsItem[]>(newsQueryKey, payload.items);
              }
              return;
            }

            if (name === 'news') {
              const item = JSON.parse(raw) as NewsItem;
              queryClient.setQueryData<NewsItem[]>(newsQueryKey, (prev = []) =>
                mergeNewsItem(prev, item)
              );
            }
          } catch {
            // Malformed event - skip it, the stream keeps running.
          }
        },
      },
      ApiClient.withBearerToken(token)
    );

    stream.connect();
    return () => stream.close();
  }, [token, queryClient]);
};
