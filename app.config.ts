import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'TradeZen',
  description:
    'TradeZen is a calm mobile trading workspace for Bebop RFQ swaps, token discovery, watchlists, and portfolio tracking.',
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
    name: 'TradeZen - Tokenized Stock Trading',
    shortName: 'TradeZen',
    description:
      'Discover tokens, build a watchlist, and execute Bebop RFQ trades in a fast mobile-first trading app.',
    lang: 'en',
    themeColor: '#07110b',
    backgroundColor: '#07110b',
    display: 'standalone',
    startUrl: '/',
  },
  extra: {
    seo: {
      title: 'TradeZen - Tokenized Stock Trading App',
      description:
        'TradeZen helps traders discover tokens, build watchlists, and execute Bebop RFQ swaps from a clean mobile interface.',
      keywords: [
        'TradeZen',
        'Bebop',
        'RFQ trading',
        'DEX',
        'crypto swap',
        'watchlist',
        'mobile trading',
      ],
    },
  },
  plugins: [
    'expo-router',
    'expo-audio',
    'expo-asset',
    'expo-secure-store',
    'expo-web-browser',
  ],
};

export default config;
