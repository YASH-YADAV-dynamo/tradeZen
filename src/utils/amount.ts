export const toBaseUnits = (amount: string, decimals: number): string => {
  const value = parseFloat(amount);
  if (!Number.isFinite(value) || value <= 0) return '0';
  return (value * 10 ** decimals).toFixed(0);
};

export const fromBaseUnits = (amount: string, decimals: number): string => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '0';
  return (value / 10 ** decimals).toString();
};
