import { useQuery } from '@tanstack/react-query';

import { newsService } from '../api';
import { NewsItem } from '../types';

export const newsQueryKey = ['news', 'latest'] as const;

export const useNews = () =>
  useQuery<NewsItem[]>({
    queryKey: newsQueryKey,
    queryFn: () => newsService.getNews(),
    staleTime: 30_000,
  });
