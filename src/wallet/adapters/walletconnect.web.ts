import EthereumProvider from '@walletconnect/ethereum-provider';

import type { BebopTx } from '../../api/types';
import { WALLETCONNECT_PROJECT_ID, isWalletConnectConfigured } from '../../config/wallet';
import type { ConnectedWallet, WalletAdapter } from '../types';

type WcProvider = Awaited<ReturnType<typeof EthereumProvider.init>>;

let provider: WcProvider | null = null;

const CHAINS = [1, 42161, 137, 8453, 10, 56, 43114] as const;

async function getOrCreateProvider(): Promise<WcProvider> {
  if (provider) return provider;
  provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [1],
    optionalChains: [...CHAINS],
    showQrModal: true,
    metadata: {
      name: 'TradeZen',
      description: 'Trade tokenized assets with Bebop RFQ',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://tradezen.app',
      icons: [],
    },
  });
  return provider;
}

/**
 * Standalone WalletConnect adapter for web (MetaMask mobile, Rainbow, etc.).
 * Requires EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID.
 */
export const walletConnectAdapter: WalletAdapter = {
  id: 'walletconnect',

  isAvailable() {
    return isWalletConnectConfigured();
  },

  async connect(): Promise<ConnectedWallet> {
    const wc = await getOrCreateProvider();
    const accounts = (await wc.enable()) as string[];
    if (!accounts?.length) throw new Error('WalletConnect returned no accounts');
    const chainId = wc.chainId;
    return { address: accounts[0], chainId, source: 'walletconnect' };
  },

  async disconnect(): Promise<void> {
    if (provider) {
      await provider.disconnect();
      provider = null;
    }
  },

  async signMessage(address: string, message: string): Promise<string> {
    const wc = provider ?? (await getOrCreateProvider());
    return wc.request({
      method: 'personal_sign',
      params: [message, address],
    }) as Promise<string>;
  },

  async signTypedData(address: string, typedData: Record<string, unknown>): Promise<string> {
    const wc = provider ?? (await getOrCreateProvider());
    return wc.request({
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify(typedData)],
    }) as Promise<string>;
  },

  async sendTransaction(tx: BebopTx): Promise<string> {
    const wc = provider ?? (await getOrCreateProvider());
    return wc.request({
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
    return provider?.chainId ?? null;
  },
};
