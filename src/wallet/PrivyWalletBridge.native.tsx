import React, { useEffect, useRef } from 'react';
import { useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';

import type { BebopTx } from '../api/types';
import { isPrivyConfigured } from '../config/wallet';
import { setPrivyBridge, type PrivyBridge } from './adapters/privy';
import { PRIVY_NATIVE_LOGIN_METHODS } from './privyConfig';

type Ctx = {
  isReady: boolean;
  login: ReturnType<typeof useLogin>['login'];
  logout: ReturnType<typeof usePrivy>['logout'];
  wallets: ReturnType<typeof useEmbeddedEthereumWallet>['wallets'];
  createWallet: ReturnType<typeof useEmbeddedEthereumWallet>['create'];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForWallet(ctx: React.MutableRefObject<Ctx>, tries = 20): Promise<string> {
  for (let i = 0; i < tries; i++) {
    const w = ctx.current.wallets[0];
    if (w?.address) return w.address;
    await sleep(150);
  }
  throw new Error('Ethereum wallet not ready. Try again.');
}

/** Gate UI hooks until Privy client + PrivyElements are ready. */
function PrivyWalletBridgeInner(): null {
  const { isReady, logout } = usePrivy();
  const { login } = useLogin();
  const { wallets, create } = useEmbeddedEthereumWallet();
  const ctx = useRef<Ctx>({ isReady, login, logout, wallets, createWallet: create });
  ctx.current = { isReady, login, logout, wallets, createWallet: create };

  useEffect(() => {
    if (!isPrivyConfigured()) {
      setPrivyBridge(null);
      return;
    }

    const bridge: PrivyBridge = {
      isReady: () => ctx.current.isReady,
      getAddress: () => ctx.current.wallets[0]?.address ?? null,
      async connect() {
        if (!ctx.current.isReady) {
          throw new Error('Privy is still starting up. Wait a moment and retry.');
        }
        try {
          await ctx.current.login({ loginMethods: [...PRIVY_NATIVE_LOGIN_METHODS] });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Login cancelled';
          if (msg.toLowerCase().includes('closed') || msg.toLowerCase().includes('cancel')) {
            throw new Error('Wallet connection cancelled');
          }
          throw err;
        }
        if (!ctx.current.wallets.length) {
          await ctx.current.createWallet({ createAdditional: false });
        }
        const address = await waitForWallet(ctx);
        return { address, source: 'privy' };
      },
      async disconnect() {
        await ctx.current.logout();
      },
      async signMessage(message) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getProvider();
        return provider.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        }) as Promise<string>;
      },
      async signTypedData(typedData) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getProvider();
        return provider.request({
          method: 'eth_signTypedData_v4',
          params: [wallet.address, JSON.stringify(typedData)],
        }) as Promise<string>;
      },
      async sendTransaction(tx: BebopTx) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getProvider();
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
    };

    setPrivyBridge(bridge);
    return () => setPrivyBridge(null);
  }, [isReady]);

  return null;
}

function PrivyWalletBridgeGate(): React.JSX.Element | null {
  const { isReady } = usePrivy();
  if (!isReady) return null;
  return <PrivyWalletBridgeInner />;
}

export function PrivyWalletBridge(): React.JSX.Element | null {
  if (!isPrivyConfigured()) return null;
  return <PrivyWalletBridgeGate />;
}
