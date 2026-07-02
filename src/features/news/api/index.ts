import { apiClient } from '../../../core/api';
import { createNewsService } from './NewsService';

export { NewsService, createNewsService } from './NewsService';

export const newsService = createNewsService(apiClient);
