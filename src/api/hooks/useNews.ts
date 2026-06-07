import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { api, apiPaths } from '../backend';
import { useNewsStore } from '../../store/newsStore';
import type { NewsItem, NewsQueryParams } from '../types';

/**
 * Backend recommends one wide fetch (`limit=50`, no symbol/type filter) and
 * letting every view derive its slice via `filterNews()`. Use this hook from
 * the root layout / market screen to keep `newsStore.items[]` warm.
 */
export const useAllNews = () =>
  useQuery<NewsItem[]>({
    queryKey: ['news', 'all', 50],
    queryFn: async () => {
      const { data } = await api.get<NewsItem[]>(apiPaths.news, { params: { limit: 50 } });
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

/**
 * Seeds the global news store with the latest REST snapshot. Mounting this
 * hook anywhere keeps the store hydrated for every consumer.
 */
export const useNewsHydration = (): { isLoading: boolean; isError: boolean } => {
  const seed = useNewsStore((s) => s.seed);
  const query = useAllNews();

  useEffect(() => {
    if (query.data) seed(query.data);
  }, [query.data, seed]);

  return { isLoading: query.isLoading, isError: query.isError };
};

/**
 * Deep-link / narrow-feed query — for `/token/[symbol]` pages and similar
 * use cases that want a thin server-side slice (cheaper for the backend).
 * For the home feed prefer `useAllNews()` + `filterNews(items, ...)`.
 */
export const useNews = (params: NewsQueryParams = {}) =>
  useQuery<NewsItem[]>({
    queryKey: ['news', params],
    queryFn: async () => {
      const { data } = await api.get<NewsItem[]>(apiPaths.news, { params });
      return data;
    },
    staleTime: 60_000,
    retry: 1,
  });
