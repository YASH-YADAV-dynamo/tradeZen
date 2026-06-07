/** Privy credentials — https://dashboard.privy.io */
export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID ?? '';
export const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID ?? '';

/** WalletConnect Cloud project id — https://cloud.walletconnect.com */
export const WALLETCONNECT_PROJECT_ID =
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const isPrivyConfigured = (): boolean => PRIVY_APP_ID.length > 0;

export const isWalletConnectConfigured = (): boolean =>
  WALLETCONNECT_PROJECT_ID.length > 0;
