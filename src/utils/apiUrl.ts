import { Platform } from 'react-native';

/**
 * Resolves the backend base URL for the current runtime.
 * - Uses EXPO_PUBLIC_API_URL when set.
 * - On native dev (Expo Go), rewrites localhost to the Metro host IP so the phone can reach your PC.
 */
export const getApiBaseUrl = (): string => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  
  if (configured) {
    const normalized = configured.replace(/\/$/, '');
    
    // On native platforms, rewrite localhost to LAN IP if available
    if (Platform.OS !== 'web') {
      const devHost = resolveDevHost();
      if (devHost && isLoopbackUrl(normalized)) {
        return rewriteHost(normalized, devHost);
      }
    }
    return normalized;
  }

  // Fallbacks when no env var is set
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  const devHost = resolveDevHost();
  if (devHost) return `http://${devHost}:8080`;
  return 'http://localhost:8080';
};

const isLoopbackUrl = (url: string): boolean => {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
};

const rewriteHost = (url: string, host: string): string => {
  try {
    const parsed = new URL(url);
    parsed.hostname = host;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
};

const resolveDevHost = (): string | null => {
  // Skip on web - no need for LAN IP rewrite
  if (Platform.OS === 'web') return null;
  
  try {
    // Dynamic import to avoid issues on web
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    const hostUri = Constants?.expoConfig?.hostUri ?? Constants?.expoGoConfig?.debuggerHost;
    if (!hostUri) return null;

    const host = hostUri.split(':')[0];
    if (!host || host === 'localhost' || host === '127.0.0.1') return null;
    return host;
  } catch {
    return null;
  }
};

export const getWsBaseUrl = (): string => {
  const base = getApiBaseUrl();
  if (base.startsWith('https://')) return base.replace('https://', 'wss://');
  return base.replace('http://', 'ws://');
};
