type EthereumProvider = {
  request: (args: { method: string; params: unknown[] }) => Promise<string>;
};

const getProvider = (): EthereumProvider | null => {
  if (typeof globalThis === 'undefined') return null;
  const eth = (globalThis as { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
};

export async function signPersonalMessage(
  address: string,
  message: string
): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('No wallet available. Connect MetaMask on web or add a wallet SDK.');
  }
  return provider.request({
    method: 'personal_sign',
    params: [message, address],
  });
}

export async function signTypedData(
  address: string,
  typedData: Record<string, unknown>
): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('No wallet available. Connect MetaMask on web or add a wallet SDK.');
  }
  return provider.request({
    method: 'eth_signTypedData_v4',
    params: [address, JSON.stringify(typedData)],
  });
}
