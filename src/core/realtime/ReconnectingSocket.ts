import { env } from '../config/env';

type SocketHandlers<T> = {
  onMessage: (data: T) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Thin wrapper around the native WebSocket with exponential-backoff
 * reconnection. Every RN/browser WebSocket consumer in the app goes through
 * this instead of hand-rolling reconnect logic per feature.
 *
 * Intentionally dumb about *what* it sends/receives — callers own parsing
 * (via `onMessage`) and typically forward parsed data straight into a
 * react-query cache rather than a separate store.
 */
export class ReconnectingSocket<T> {
  private socket: WebSocket | null = null;
  private shouldReconnect = true;
  private readonly baseRetryDelayMs: number;
  private retryDelayMs: number;
  private readonly maxRetryDelayMs: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly url: string,
    private readonly handlers: SocketHandlers<T>,
    private readonly parse: (raw: string) => T = (raw) => JSON.parse(raw) as T,
    backoff: { baseMs?: number; maxMs?: number } = {}
  ) {
    this.baseRetryDelayMs = backoff.baseMs ?? env.wsReconnectBaseMs;
    this.retryDelayMs = this.baseRetryDelayMs;
    this.maxRetryDelayMs = backoff.maxMs ?? env.wsReconnectMaxMs;
  }

  connect(): void {
    this.shouldReconnect = true;
    this.open();
  }

  close(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  private open(): void {
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      this.retryDelayMs = this.baseRetryDelayMs;
      this.handlers.onOpen?.();
    };

    socket.onmessage = (event) => {
      try {
        this.handlers.onMessage(this.parse(event.data as string));
      } catch {
        // Malformed frame — ignore it, the next one will likely be fine.
      }
    };

    socket.onclose = () => {
      this.handlers.onClose?.();
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    this.reconnectTimer = setTimeout(() => {
      this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.maxRetryDelayMs);
      this.open();
    }, this.retryDelayMs);
  }
}
