/**
 * Single source of truth for environment-derived configuration. Every
 * tunable value that isn't a design token lives here, read from
 * EXPO_PUBLIC_* vars (see .env.example) — never hardcoded in a service,
 * hook, or component. Add a new knob here first, then reference `env.*`
 * wherever it's needed.
 */
const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value !== undefined && Number.isFinite(parsed) ? parsed : fallback;
};

const bool = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined ? fallback : value === 'true';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export const env = {
  /** Base URL of the Go backend (see docs/backend-integration.md). No trailing slash. */
  apiUrl,
  /** Same host as apiUrl, ws(s):// instead of http(s):// — for /ws/* endpoints. */
  wsUrl: apiUrl.replace(/^http/, 'ws'),

  /** Chain slug used until the user picks one in Settings. Must match a Bebop-supported chain. */
  defaultChain: process.env.EXPO_PUBLIC_DEFAULT_CHAIN ?? 'ethereum',

  /** How often /api/prices is polled when /ws/prices isn't connected. */
  priceFallbackPollMs: num(process.env.EXPO_PUBLIC_PRICE_FALLBACK_POLL_MS, 15_000),
  /** How often /api/order/:quoteId/status is polled when /ws/order isn't connected. */
  orderFallbackPollMs: num(process.env.EXPO_PUBLIC_ORDER_FALLBACK_POLL_MS, 4_000),

  /** WebSocket reconnect backoff (ReconnectingSocket), start and ceiling. */
  wsReconnectBaseMs: num(process.env.EXPO_PUBLIC_WS_RECONNECT_BASE_MS, 1_000),
  wsReconnectMaxMs: num(process.env.EXPO_PUBLIC_WS_RECONNECT_MAX_MS, 15_000),

  /** Page size for GET /api/news. */
  newsPageSize: num(process.env.EXPO_PUBLIC_NEWS_PAGE_SIZE, 20),
  /** `size` param for GET /api/portfolio (Bebop history page size). */
  portfolioPageSize: num(process.env.EXPO_PUBLIC_PORTFOLIO_PAGE_SIZE, 50),

  /** Sent as `gasless` on every /api/quote request unless the user overrides it in the trade sheet. */
  quoteGaslessDefault: bool(process.env.EXPO_PUBLIC_QUOTE_GASLESS_DEFAULT, true),

  /** Axios request timeout (ms) used by every ApiClient instance. */
  apiTimeoutMs: num(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 15_000),

  /** SecureStore key the JWT is saved under. */
  tokenStorageKey: process.env.EXPO_PUBLIC_TOKEN_STORAGE_KEY ?? 'tradezen_jwt',
} as const;
