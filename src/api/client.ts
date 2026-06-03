import axios from 'axios';

const apiBaseUrl =
  process.env.EXPO_PUBLIC_XSTOCKS_API_BASE_URL ?? 'https://api.xstocks.fi/api/v2';

export const xstocksApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
});
