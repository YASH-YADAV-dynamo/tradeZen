import axios, { AxiosInstance } from 'axios';

import { ApiError } from './ApiError';
import { env } from '../config/env';

interface ApiClientConfig {
  baseURL: string;
  timeoutMs?: number;
}

/**
 * Thin, typed wrapper around an axios instance. Every concrete *Service
 * class (e.g. MarketsService) is composed with one of these instead of
 * importing axios directly, so swapping the HTTP layer or adding
 * cross-cutting behaviour (retries, logging, auth) happens in a single
 * place.
 */
export class ApiClient {
  private readonly http: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.http = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeoutMs ?? env.apiTimeoutMs,
    });
  }

  async get<T>(path: string, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      const { data } = await this.http.get<T>(path, { headers: options?.headers });
      return data;
    } catch (error) {
      throw ApiError.from(error);
    }
  }

  async post<T>(
    path: string,
    body: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const { data } = await this.http.post<T>(path, body, { headers: options?.headers });
      return data;
    } catch (error) {
      throw ApiError.from(error);
    }
  }

  /** Builds the `Authorization: Bearer <jwt>` header for protected endpoints. */
  static withBearerToken(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }
}

export const createApiClient = (config: ApiClientConfig): ApiClient => new ApiClient(config);
