import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '../config/wallet';

/** Shared dark-theme appearance for Privy modals. */
export const PRIVY_APPEARANCE = {
  theme: 'dark' as const,
  accentColor: '#33d17a' as `#${string}`,
  logo: undefined,
};

/** Login methods for Privy Expo (native). External wallets via WalletConnect are enabled in the Privy dashboard. */
export const PRIVY_NATIVE_LOGIN_METHODS = ['email', 'google', 'apple'] as const;

/** Login methods for Privy React Auth (web). */
export const PRIVY_WEB_LOGIN_METHODS = [
  'email',
  'google',
  'apple',
  'wallet',
] as const;

export const privyProviderProps = {
  appId: PRIVY_APP_ID,
  clientId: PRIVY_CLIENT_ID || undefined,
};
