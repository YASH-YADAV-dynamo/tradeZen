import { createApiClient } from './ApiClient';
import { env } from '../config/env';

/** The one HTTP client every feature service is built on top of. */
export const apiClient = createApiClient({ baseURL: env.apiUrl });

export { ApiError } from './ApiError';
export { ApiClient, createApiClient } from './ApiClient';
