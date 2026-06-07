import type { BebopTx } from '../../api/types';
import type { ConnectedWallet, WalletAdapter } from '../types';

type EthereumProvider = {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

const getProvider = (): EthereumProvider | null => {
  if (typeof globalThis === 'undefined') return null;
  const eth = (globalThis as { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
};

const detectSource = (provider: EthereumProvider): string => {
  if (provider.isMetaMask) return 'metamask';
  if (provider.isRabby) return 'rabby';
  if (provider.isCoinbaseWallet) return 'coinbase';
  return 'injected';
};

/**
 * Browser-injected wallet adapter (MetaMask, Rabby, Coinbase, …).
 * Available whenever `window.ethereum` exists.
 */
export const injectedAdapter: WalletAdapter = {
  id: 'web-injected',

  isAvailable() {
    return !!getProvider();
  },

  async connect(): Promise<ConnectedWallet> {
    const provider = getProvider();
    if (!provider) {
      throw new Error('No browser wallet detected. Install MetaMask or Rabby.');
    }
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts?.length) {
      throw new Error('Wallet returned no accounts');
    }
    const address = accounts[0];
    let chainId: number | undefined;
    try {
      const hex = (await provider.request({ method: 'eth_chainId' })) as string;
      chainId = Number.parseInt(hex, 16);
    } catch {
      /* chain id is best-effort */
    }
    return { address, chainId, source: detectSource(provider) };
  },

  async disconnect(): Promise<void> {
    // Browser wallets don't expose a programmatic disconnect; just clear local state.
  },

  async signMessage(address: string, message: string): Promise<string> {
    const provider = getProvider();
    if (!provider) throw new Error('No browser wallet detected');
    return provider.request({
      method: 'personal_sign',
      params: [message, address],
    }) as Promise<string>;
  },

  async signTypedData(address: string, typedData: Record<string, unknown>): Promise<string> {
    const provider = getProvider();
    if (!provider) throw new Error('No browser wallet detected');
    return provider.request({
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify(typedData)],
    }) as Promise<string>;
  },

  async sendTransaction(tx: BebopTx): Promise<string> {
    const provider = getProvider();
    if (!provider) throw new Error('No browser wallet detected');
    return provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: tx.from,
          to: tx.to,
          data: tx.data,
          value: tx.value,
          gas: `0x${tx.gas.toString(16)}`,
          gasPrice: `0x${tx.gasPrice.toString(16)}`,
        },
      ],
    }) as Promise<string>;
  },

  async getChainId(): Promise<number | null> {
    const provider = getProvider();
    if (!provider) return null;
    try {
      const hex = (await provider.request({ method: 'eth_chainId' })) as string;
      return Number.parseInt(hex, 16);
    } catch {
      return null;
    }
  },

  async switchChain(chainId: number): Promise<void> {
    const provider = getProvider();
    if (!provider) throw new Error('No browser wallet detected');
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  },
};

export const subscribeToProviderEvents = (
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): (() => void) => {
  const provider = getProvider();
  if (!provider?.on || !provider.removeListener) return () => undefined;
  const accountsHandler = (...args: unknown[]) => onAccountsChanged(args[0] as string[]);
  const chainHandler = (...args: unknown[]) => onChainChanged(args[0] as string);
  provider.on('accountsChanged', accountsHandler);
  provider.on('chainChanged', chainHandler);
  return () => {
    provider.removeListener?.('accountsChanged', accountsHandler);
    provider.removeListener?.('chainChanged', chainHandler);
  };
};
