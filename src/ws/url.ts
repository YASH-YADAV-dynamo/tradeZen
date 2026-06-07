/** Converts EXPO_PUBLIC_API_URL (http/https) to a WebSocket base (ws/wss). */
export const getWsBaseUrl = (): string => {
  const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
  return base.replace('https', 'wss').replace('http', 'ws');
};
