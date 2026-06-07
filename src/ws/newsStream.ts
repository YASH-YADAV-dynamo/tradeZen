import type { NewsItem, SSEConnectedEvent } from '../api/types';
import { apiPaths } from '../api/backend';
import { IS_WEB } from '../platform';
import { useNewsStore } from '../store/newsStore';
import { getApiBaseUrl } from '../utils/apiUrl';

type NewsStreamEvent = 'connected' | 'news' | 'ping';

export type NewsStreamOptions = {
  jwt: string;
  /** Subscribe to all news. Recommended for the main app session. */
  all?: boolean;
  /** Narrow server-side filter — use for background workers / deep links. */
  symbols?: string[];
  onConnected?: (items: NewsItem[]) => void;
  onNews?: (item: NewsItem) => void;
};

const buildUrl = (opts: NewsStreamOptions): string => {
  const params = new URLSearchParams();
  if (opts.all) params.set('all', 'true');
  else if (opts.symbols?.length) params.set('symbols', opts.symbols.join(','));
  const query = params.toString();
  return `${getApiBaseUrl()}${apiPaths.newsSSE}${query ? `?${query}` : ''}`;
};

const safeParse = <T>(raw: string | null | undefined): T | null => {
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * Opens an authenticated SSE news feed.
 *
 * - Native: uses react-native-sse (lazy require; supports Authorization headers).
 * - Web:    uses @microsoft/fetch-event-source — the browser's native EventSource
 *           cannot send custom headers, but the backend requires
 *           `Authorization: Bearer <jwt>`, so we replace it with a fetch-backed
 *           polyfill that supports both.
 *
 * Returns an unsubscribe function.
 */
export function connectNewsStream(opts: NewsStreamOptions): () => void {
  if (!opts.jwt) return () => undefined;

  if (IS_WEB) {
    return connectViaFetchEventSource(opts);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const RNEventSource = require('react-native-sse').default as typeof import('react-native-sse').default;
    const es = new RNEventSource<NewsStreamEvent>(buildUrl(opts), {
      headers: { Authorization: `Bearer ${opts.jwt}` },
    });

    es.addEventListener('connected', (event) => {
      if (typeof event.data !== 'string') return;
      const payload = safeParse<SSEConnectedEvent>(event.data);
      if (!payload) return;
      useNewsStore.getState().seed(payload.items);
      opts.onConnected?.(payload.items);
    });

    es.addEventListener('news', (event) => {
      if (typeof event.data !== 'string') return;
      const item = safeParse<NewsItem>(event.data);
      if (!item) return;
      useNewsStore.getState().addItem(item);
      opts.onNews?.(item);
    });

    es.addEventListener('ping', () => undefined);

    return () => es.close();
  } catch {
    return () => undefined;
  }
}

function connectViaFetchEventSource(opts: NewsStreamOptions): () => void {
  if (typeof fetch === 'undefined' || typeof AbortController === 'undefined') {
    return () => undefined;
  }
  const controller = new AbortController();

  // Lazy require keeps the web bundle slim and avoids breaking native bundlers.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const mod = require('@microsoft/fetch-event-source') as typeof import('@microsoft/fetch-event-source');

  void mod.fetchEventSource(buildUrl(opts), {
    method: 'GET',
    headers: { Authorization: `Bearer ${opts.jwt}` },
    signal: controller.signal,
    openWhenHidden: true,
    onmessage(ev) {
      if (ev.event === 'connected') {
        const payload = safeParse<SSEConnectedEvent>(ev.data);
        if (!payload) return;
        useNewsStore.getState().seed(payload.items);
        opts.onConnected?.(payload.items);
        return;
      }
      if (ev.event === 'news') {
        const item = safeParse<NewsItem>(ev.data);
        if (!item) return;
        useNewsStore.getState().addItem(item);
        opts.onNews?.(item);
        return;
      }
      // ping / unknown — ignore
    },
    onerror() {
      // throw to stop retry loop only on auth errors; otherwise the lib will reconnect.
    },
  });

  return () => controller.abort();
}
