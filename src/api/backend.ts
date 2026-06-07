import axios from 'axios';

import { getWalletStore } from '../store/walletStore';
import { getApiBaseUrl } from '../utils/apiUrl';

const API_URL = getApiBaseUrl();

/**
 * Single HTTP client for the Go backend.
 * Bebop credentials never enter the frontend — all RFQ calls are proxied server-side.
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const jwt = getWalletStore().jwt;
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      getWalletStore().clearJwt();
    }
    const message = error.response?.data?.error ?? error.message;
    return Promise.reject(new Error(message));
  }
);

export const wsBase = API_URL.replace(/^http/, 'ws');

export const apiPaths = {
  health: '/health',
  nonce: '/api/auth/nonce',
  verify: '/api/auth/verify',
  tokens: '/api/tokens',
  prices: '/api/prices',
  news: '/api/news',
  quote: '/api/quote',
  order: '/api/order',
  orderStatus: (id: string) => `/api/order/${id}/status`,
  portfolio: '/api/portfolio',
  newsSSE: '/sse/news',
  pricesWS: (chain: string) => `/ws/prices?chain=${chain}`,
  orderWS: (id: string) => `/ws/order/${id}`,
} as const;
