import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'TradeZen',
  description:
    'TradeZen is a mobile trading workspace for discovering tokens, watching live prices and news, and swapping across chains with wallet-based login.',
  slug: 'tradezen',
  scheme: 'tradezen',
  version: '1.0.0',
  primaryColor: '#33d17a',
  backgroundColor: '#07110b',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#07110b',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#07110b',
    },
  },
  web: {
    bundler: 'metro',
    name: 'TradeZen - Multi-Chain Token Trading',
    shortName: 'TradeZen',
    description:
      'Discover tokens, watch live prices and news, build a watchlist, and swap across chains with wallet-based login.',
    lang: 'en',
    themeColor: '#07110b',
    backgroundColor: '#07110b',
    display: 'standalone',
    startUrl: '/',
  },
  extra: {
    seo: {
      title: 'TradeZen - Multi-Chain Token Trading App',
      description:
        'TradeZen helps traders discover tokens, watch live prices and news, build watchlists, and swap across chains from a clean mobile interface.',
      keywords: [
        'TradeZen',
        'token trading',
        'crypto swap',
        'wallet login',
        'live prices',
        'watchlist',
        'mobile trading',
      ],
    },
  },
  plugins: ['expo-router', 'expo-audio', 'expo-asset'],
};

export default config;
