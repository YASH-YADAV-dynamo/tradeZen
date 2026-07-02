import { env } from '../config/env';

export const buildWsUrl = (path: string, params?: Record<string, string>): string => {
  const url = new URL(path, env.wsUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  }
  return url.toString();
};

export const buildSseUrl = (path: string, params?: Record<string, string>): string => {
  const url = new URL(path, env.apiUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  }
  return url.toString();
};
