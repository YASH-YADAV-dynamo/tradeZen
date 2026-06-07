import { IS_WEB } from '../platform';
import { usePriceStore } from '../store/priceStore';
import { getWsBaseUrl } from '../utils/apiUrl';

/**
 * Singleton price WebSocket client.
 * - Reconnects with exponential backoff (1s → 30s)
 * - Decodes string / ArrayBuffer / Blob payloads
 * - Skips entirely during SSR/SSG (no `WebSocket` global)
 */

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let activeChain = '';
let backoffMs = 1000;
let subscribers = 0;

const hasWebSocket = (): boolean =>
  typeof WebSocket !== 'undefined' && (typeof window !== 'undefined' || !IS_WEB);

const decode = async (data: unknown): Promise<string | null> => {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (typeof Blob !== 'undefined' && data instanceof Blob) return data.text();
  return null;
};

const open = (chain: string): void => {
  if (!hasWebSocket()) return;

  const url = `${getWsBaseUrl()}/ws/prices?chain=${encodeURIComponent(chain)}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    backoffMs = 1000;
    usePriceStore.getState().setWsConnected(true);
  };

  ws.onmessage = (event) => {
    void decode(event.data)
      .then((text) => {
        if (!text) return;
        try {
          usePriceStore.getState().ingest(JSON.parse(text));
        } catch {
          /* Ignore malformed payloads. */
        }
      })
      .catch(() => undefined);
  };

  ws.onclose = () => {
    ws = null;
    usePriceStore.getState().setWsConnected(false);
    if (subscribers === 0) return;
    reconnectTimer = setTimeout(() => {
      backoffMs = Math.min(backoffMs * 2, 30_000);
      open(activeChain);
    }, backoffMs);
  };

  ws.onerror = () => {
    try {
      ws?.close();
    } catch {
      /* noop */
    }
  };
};

/**
 * Acquire a price-feed subscription. Returns an unsubscribe function.
 * Multiple callers share a single WS; the connection closes when the
 * last subscriber unsubscribes.
 */
export const subscribePriceFeed = (chain: string): (() => void) => {
  if (!chain) return () => undefined;

  subscribers += 1;

  if (activeChain !== chain) {
    activeChain = chain;
    teardown();
    open(chain);
  } else if (!ws) {
    open(chain);
  }

  return () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) teardown();
  };
};

const teardown = (): void => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
  try {
    ws?.close();
  } catch {
    /* noop */
  }
  ws = null;
  usePriceStore.getState().setWsConnected(false);
};

/** Legacy connect/disconnect shims for any remaining callers. */
export const connectPriceSocket = (chain: string): void => {
  subscribePriceFeed(chain);
};

export const disconnectPriceSocket = (): void => {
  subscribers = 0;
  activeChain = '';
  teardown();
};
