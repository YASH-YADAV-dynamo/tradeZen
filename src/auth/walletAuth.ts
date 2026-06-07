import { api, apiPaths } from '../api/backend';
import type { NonceResponse, VerifyResponse } from '../api/types';
import { getWalletStore } from '../store/walletStore';

export async function authenticateWallet(
  address: string,
  signMessage: (message: string) => Promise<string>
): Promise<void> {
  const { data: nonceData } = await api.get<NonceResponse>(apiPaths.nonce, {
    params: { wallet: address },
  });

  const signature = await signMessage(nonceData.nonce);

  const { data: verifyData } = await api.post<VerifyResponse>(apiPaths.verify, {
    wallet: address,
    signature,
  });

  const { chain } = getWalletStore();
  getWalletStore().setJwt(verifyData.token);
  getWalletStore().setWallet(address, chain);
}
