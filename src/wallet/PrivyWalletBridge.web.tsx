import React, { useEffect, useRef } from 'react';
import {
  useConnectWallet,
  useLogin,
  useLogout,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';

import type { BebopTx } from '../api/types';
import { isPrivyConfigured } from '../config/wallet';
import { setPrivyBridge, type PrivyBridge } from './adapters/privy';

type Ctx = {
  ready: boolean;
  authenticated: boolean;
  login: ReturnType<typeof useLogin>['login'];
  logout: ReturnType<typeof useLogout>['logout'];
  connectWallet: ReturnType<typeof useConnectWallet>['connectWallet'];
  wallets: ReturnType<typeof useWallets>['wallets'];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function resolveWallet(ctx: React.MutableRefObject<Ctx>): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const w = ctx.current.wallets[0];
    if (w?.address) return w.address;
    await sleep(150);
  }
  throw new Error('Wallet not ready after Privy login');
}

/** Wires Privy React Auth into the shared wallet adapter bridge (web). */
export function PrivyWalletBridge(): null {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { connectWallet } = useConnectWallet();
  const { wallets } = useWallets();

  const ctx = useRef<Ctx>({
    ready,
    authenticated,
    login,
    logout,
    connectWallet,
    wallets,
  });
  ctx.current = { ready, authenticated, login, logout, connectWallet, wallets };

  useEffect(() => {
    if (!isPrivyConfigured()) {
      setPrivyBridge(null);
      return;
    }

    const bridge: PrivyBridge = {
      isReady: () => ctx.current.ready,
      getAddress: () => ctx.current.wallets[0]?.address ?? null,
      async connect() {
        if (!ctx.current.ready) throw new Error('Privy is still loading');
        if (!ctx.current.authenticated) {
          await ctx.current.login();
        }
        if (!ctx.current.wallets.length) {
          await ctx.current.connectWallet();
        }
        const address = await resolveWallet(ctx);
        return { address, source: 'privy' };
      },
      async disconnect() {
        await ctx.current.logout();
      },
      async signMessage(message) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getEthereumProvider();
        return provider.request({
          method: 'personal_sign',
          params: [message, wallet.address],
        }) as Promise<string>;
      },
      async signTypedData(typedData) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getEthereumProvider();
        return provider.request({
          method: 'eth_signTypedData_v4',
          params: [wallet.address, JSON.stringify(typedData)],
        }) as Promise<string>;
      },
      async sendTransaction(tx: BebopTx) {
        const wallet = ctx.current.wallets[0];
        if (!wallet) throw new Error('No Privy wallet connected');
        const provider = await wallet.getEthereumProvider();
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
  }, [ready, authenticated, wallets.length]);

  return null;
}
