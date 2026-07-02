/** Converts a human-entered decimal amount (e.g. "0.5") into base units (wei-style) as a string. */
export const toBaseUnits = (amount: string, decimals: number): string => {
  const trimmed = amount.trim();
  if (!trimmed || Number.isNaN(Number(trimmed))) return '0';

  const [whole, fraction = ''] = trimmed.split('.');
  const paddedFraction = fraction.slice(0, decimals).padEnd(decimals, '0');
  const combined = `${whole || '0'}${paddedFraction}`.replace(/^0+(?=\d)/, '');

  try {
    return BigInt(combined || '0').toString();
  } catch {
    return '0';
  }
};

/** Converts base units back into a human-readable decimal string. */
export const fromBaseUnits = (amount: string, decimals: number, maxFractionDigits = 6): string => {
  try {
    const value = BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = (value % divisor).toString().padStart(decimals, '0').slice(0, maxFractionDigits);
    return fraction.replace(/0+$/, '') ? `${whole}.${fraction.replace(/0+$/, '')}` : whole.toString();
  } catch {
    return '0';
  }
};
