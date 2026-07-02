/**
 * Everything the auth and trade flows need from a connected wallet:
 * signing a plain message (login) and signing EIP-712 typed data (trade
 * quotes). This project doesn't bundle a wallet SDK (WalletConnect, an
 * injected browser provider, etc.) yet, so `defaultWalletSigner` below is a
 * clearly-failing placeholder — swap it for a real implementation once a
 * wallet connector is chosen, and every call site (useLogin, useCreateQuote
 * consumers) picks it up automatically.
 */
export interface WalletSigner {
  signMessage(message: string): Promise<string>;
  signTypedData(payload: unknown): Promise<string>;
}

export const defaultWalletSigner: WalletSigner = {
  async signMessage() {
    throw new Error(
      'No wallet provider is connected. Wire a real WalletSigner (e.g. WalletConnect) ' +
        'and pass it to useLogin()/useCreateQuote() before calling this.'
    );
  },
  async signTypedData() {
    throw new Error(
      'No wallet provider is connected. Wire a real WalletSigner (e.g. WalletConnect) ' +
        'and pass it to useLogin()/useCreateQuote() before calling this.'
    );
  },
};
