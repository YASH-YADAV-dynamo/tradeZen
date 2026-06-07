import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { BebopTx } from '../api/types';
import { authenticateWallet } from '../auth/walletAuth';
import { IS_DEV_MODE } from '../config/env';
import { IS_WEB } from '../platform';
import { useOrderStore } from '../store/orderStore';
import { useTradeStore } from '../store/tradeStore';
import { useWalletStore } from '../store/walletStore';
import { injectedAdapter, subscribeToProviderEvents } from './adapters/injected';
import { manualAdapter, setManualAddress } from './adapters/manual';
import { privyAdapter } from './adapters/privy';
import { walletConnectAdapter } from './adapters/walletconnect';
import { isPrivyConfigured, isWalletConnectConfigured } from '../config/wallet';
import type { ConnectedWallet, WalletAdapter, WalletStatus } from './types';

interface WalletContextValue {
  status: WalletStatus;
  address: string | null;
  source: string | null;
  isAuthenticating: boolean;
  lastError: string | null;
  availableAdapters: WalletAdapter['id'][];
  /** Open the most appropriate wallet adapter. Resolves once connected. */
  connect: (options?: { adapter?: WalletAdapter['id']; manualAddress?: string }) => Promise<void>;
  /** Sign-in with the connected wallet to get a JWT (idempotent). */
  authenticate: () => Promise<void>;
  /** Convenience: connect (if needed) + authenticate. */
  connectAndAuthenticate: (options?: {
    adapter?: WalletAdapter['id'];
    manualAddress?: string;
  }) => Promise<void>;
  disconnect: () => Promise<void>;
  signTypedData: (typedData: Record<string, unknown>) => Promise<string>;
  sendTransaction: (tx: BebopTx) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const buildCandidates = (): WalletAdapter[] => {
  const out: WalletAdapter[] = [];
  if (privyAdapter.isAvailable()) out.push(privyAdapter);
  if (walletConnectAdapter.isAvailable()) out.push(walletConnectAdapter);
  if (IS_WEB && injectedAdapter.isAvailable()) out.push(injectedAdapter);
  if (IS_DEV_MODE) out.push(manualAdapter);
  return out;
};

/** Selects the best adapter for the given runtime. */
const pickAdapter = (preferred?: WalletAdapter['id']): WalletAdapter => {
  const candidates = buildCandidates();
  if (preferred) {
    const match = candidates.find((a) => a.id === preferred);
    if (match) return match;
  }
  if (candidates[0]) return candidates[0];
  throw new Error(
    'No wallet provider configured. Set EXPO_PUBLIC_PRIVY_APP_ID (recommended) or use a browser wallet on web.'
  );
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storeAddress = useWalletStore((s) => s.address);
  const storeJwt = useWalletStore((s) => s.jwt);
  const setStoreAddress = useWalletStore((s) => s.setAddress);
  const clearJwt = useWalletStore((s) => s.clearJwt);
  const setWalletStore = useWalletStore((s) => s.setWallet);

  const [status, setStatus] = useState<WalletStatus>(storeAddress ? 'connected' : 'idle');
  const [source, setSource] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const activeAdapter = useRef<WalletAdapter | null>(null);

  const availableAdapters = useMemo<WalletAdapter['id'][]>(
    () => buildCandidates().map((a) => a.id),
    []
  );

  const connect = useCallback<WalletContextValue['connect']>(
    async (options) => {
      setLastError(null);
      setStatus('connecting');
      try {
        if (options?.manualAddress) {
          setManualAddress(options.manualAddress.trim());
        }
        const adapter = pickAdapter(options?.adapter);
        activeAdapter.current = adapter;
        const wallet: ConnectedWallet = await adapter.connect();
        setStoreAddress(wallet.address);
        setSource(wallet.source);
        setStatus('connected');
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Wallet connect failed');
        setStatus('error');
        throw err;
      }
    },
    [setStoreAddress]
  );

  const authenticate = useCallback(async () => {
    const adapter = activeAdapter.current;
    const address = useWalletStore.getState().address;
    if (!adapter) throw new Error('No wallet adapter active');
    if (!address) throw new Error('No wallet address');
    if (useWalletStore.getState().jwt) return; // already authed

    setIsAuthenticating(true);
    setLastError(null);
    try {
      await authenticateWallet(address, (msg) => adapter.signMessage(address, msg));
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const connectAndAuthenticate = useCallback<WalletContextValue['connectAndAuthenticate']>(
    async (options) => {
      if (!useWalletStore.getState().address) {
        await connect(options);
      }
      if (!useWalletStore.getState().jwt) {
        await authenticate();
      }
    },
    [connect, authenticate]
  );

  const disconnect = useCallback(async () => {
    const adapter = activeAdapter.current;
    try {
      await adapter?.disconnect();
    } finally {
      activeAdapter.current = null;
      setSource(null);
      setStatus('idle');
      useWalletStore.getState().disconnect();
      // A logged-out user shouldn't see a stale quote or pending order.
      useTradeStore.getState().reset();
      useOrderStore.getState().clearActive();
    }
  }, []);

  const signTypedData = useCallback(async (typedData: Record<string, unknown>) => {
    const adapter = activeAdapter.current;
    const address = useWalletStore.getState().address;
    if (!adapter || !address) throw new Error('Wallet not connected');
    return adapter.signTypedData(address, typedData);
  }, []);

  const sendTransaction = useCallback(async (tx: BebopTx) => {
    const adapter = activeAdapter.current;
    if (!adapter) throw new Error('Wallet not connected');
    return adapter.sendTransaction(tx);
  }, []);

  // Sync external wallet events (account/chain change) on web.
  useEffect(() => {
    if (!IS_WEB) return;
    const unsubscribe = subscribeToProviderEvents(
      (accounts) => {
        if (!accounts || accounts.length === 0) {
          void disconnect();
          return;
        }
        const next = accounts[0];
        const current = useWalletStore.getState().address;
        if (next.toLowerCase() !== current?.toLowerCase()) {
          setStoreAddress(next);
          clearJwt(); // wallet changed → must re-auth
          useTradeStore.getState().setQuote(null);
        }
      },
      () => {
        // Chain changed on the wallet side — invalidate any pending quote;
        // user has to refresh quote on the new chain anyway.
        useTradeStore.getState().setQuote(null);
      }
    );
    return unsubscribe;
  }, [disconnect, setStoreAddress, clearJwt]);

  // Keep status synced with store address (e.g. on logout).
  useEffect(() => {
    if (!storeAddress && status === 'connected') {
      setStatus('idle');
      setSource(null);
    }
  }, [storeAddress, status]);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      address: storeAddress,
      source,
      isAuthenticating,
      lastError,
      availableAdapters,
      connect,
      authenticate,
      connectAndAuthenticate,
      disconnect,
      signTypedData,
      sendTransaction,
    }),
    [
      status,
      storeAddress,
      source,
      isAuthenticating,
      lastError,
      availableAdapters,
      connect,
      authenticate,
      connectAndAuthenticate,
      disconnect,
      signTypedData,
      sendTransaction,
    ]
  );

  // We intentionally subscribe to jwt here so a logout / 401 from axios reaches the UI.
  useEffect(() => {
    if (!storeJwt && storeAddress && status === 'connected') {
      setWalletStore(storeAddress);
    }
  }, [storeJwt, storeAddress, status, setWalletStore]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};

export const walletAdapterAvailable = (id: WalletAdapter['id']): boolean => {
  if (id === 'privy') return isPrivyConfigured();
  if (id === 'walletconnect') return isWalletConnectConfigured();
  if (id === 'web-injected') return IS_WEB && injectedAdapter.isAvailable();
  if (id === 'manual') return IS_DEV_MODE;
  return false;
};
