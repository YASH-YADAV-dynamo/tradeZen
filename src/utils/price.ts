/**
 * Resolves a token price from the WS price map.
 * Backend may key prices by checksummed or lowercase address.
 */
export const lookupTokenPrice = (
  address: string,
  prices: Record<string, number>
): number | undefined =>
  prices[address] ??
  prices[address.toLowerCase()] ??
  prices[address.toUpperCase()];
