export const formatPrice = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(value >= 100 ? 2 : 4) : '--';

export const formatPct = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatVolume = (value: number): string => {
  if (!Number.isFinite(value)) return '--';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export const formatUSD = (value: number): string =>
  Number.isFinite(value)
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '--';

export const isPositive = (value: number): boolean => value >= 0;
