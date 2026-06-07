const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro config tuned for fast cross-platform development.
 * - Default Expo SDK 54 resolver (handles platform extensions automatically)
 * - inlineRequires reduces TTI by lazy-loading modules on first use
 * - Web-only resolver shim works around react-native-worklets PlatformChecker
 *   race condition that throws "createSerializableObject should never be called
 *   in JSWorklets" on web bundles.
 */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

const WORKLETS_PLATFORM_CHECKER = path.resolve(
  __dirname,
  'node_modules/react-native-worklets/lib/module/PlatformChecker/index.js'
);
const WORKLETS_PLATFORM_CHECKER_SHIM = path.resolve(
  __dirname,
  'src/platform/shims/workletsPlatformChecker.js'
);

// @privy-io/expo subpaths use package.json "exports"; Metro skips them when
// unstable_enablePackageExports is false — map them explicitly.
// IMPORTANT: use dist/esm/* so UI chunks share the same PrivyContext as
// PrivyProvider (main entry resolves to dist/esm/index.js). CJS dist/ui.js
// loads a duplicate context and crashes with "client of null".
const PRIVY_ESM = path.resolve(__dirname, 'node_modules/@privy-io/expo/dist/esm');
const PRIVY_EXPO_SUBPATHS = {
  '@privy-io/expo/ui': path.join(PRIVY_ESM, 'ui.js'),
  '@privy-io/expo/passkey': path.join(PRIVY_ESM, 'passkey.js'),
  '@privy-io/expo/smart-wallets': path.join(PRIVY_ESM, 'smart-wallets.js'),
  '@privy-io/expo/connectors': path.join(PRIVY_ESM, 'connectors.js'),
};

const originalResolveRequest = config.resolver?.resolveRequest;

// Privy + WalletConnect: disable package exports for packages that break Metro.
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: false,
  resolveRequest: (context, moduleName, platform) => {
    const privySubpath = PRIVY_EXPO_SUBPATHS[moduleName];
    if (privySubpath) {
      return { type: 'sourceFile', filePath: privySubpath };
    }

    if (platform === 'web') {
      try {
        const resolved = context.resolveRequest(context, moduleName, platform);
        if (resolved?.filePath === WORKLETS_PLATFORM_CHECKER) {
          return { type: 'sourceFile', filePath: WORKLETS_PLATFORM_CHECKER_SHIM };
        }
        return resolved;
      } catch (err) {
        if (originalResolveRequest) {
          return originalResolveRequest(context, moduleName, platform);
        }
        throw err;
      }
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
