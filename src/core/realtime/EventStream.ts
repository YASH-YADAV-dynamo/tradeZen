import RNEventSource from 'react-native-sse';
import { Platform } from 'react-native';

type EventStreamHandlers = {
  onEvent: (eventName: string, raw: string) => void;
  onOpen?: () => void;
  onError?: () => void;
};

/**
 * Wraps whichever EventSource implementation is available for the current
 * platform (native RN has no built-in EventSource; web does) behind one
 * interface, and re-subscribes to every named event the caller cares about.
 */
export class EventStream {
  private native: RNEventSource<string> | null = null;
  private web: EventSource | null = null;

  constructor(
    private readonly url: string,
    private readonly eventNames: string[],
    private readonly handlers: EventStreamHandlers,
    private readonly headers?: Record<string, string>
  ) {}

  connect(): void {
    if (Platform.OS === 'web' && typeof EventSource !== 'undefined') {
      // Browser EventSource can't set Authorization headers — pass JWT as ?token=
      const url = this.withWebAuthToken(this.url);
      const source = new EventSource(url);
      source.onopen = () => this.handlers.onOpen?.();
      source.onerror = () => this.handlers.onError?.();
      for (const name of this.eventNames) {
        source.addEventListener(name, (event: MessageEvent) =>
          this.handlers.onEvent(name, event.data)
        );
      }
      this.web = source;
      return;
    }

    const source = new RNEventSource<string>(this.url, { headers: this.headers });
    source.addEventListener('open', () => this.handlers.onOpen?.());
    source.addEventListener('error', () => this.handlers.onError?.());
    for (const name of this.eventNames) {
      source.addEventListener(name as never, (event: { data?: string | null }) =>
        this.handlers.onEvent(name, event.data ?? '')
      );
    }
    this.native = source;
  }

  close(): void {
    this.native?.close();
    this.web?.close();
    this.native = null;
    this.web = null;
  }

  private withWebAuthToken(url: string): string {
    const auth = this.headers?.Authorization;
    if (!auth?.startsWith('Bearer ')) return url;

    const parsed = new URL(url);
    parsed.searchParams.set('token', auth.slice('Bearer '.length));
    return parsed.toString();
  }
}
