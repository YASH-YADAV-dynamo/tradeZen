export const formatPrice = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(value >= 100 ? 2 : 4) : '--';

export const formatUSD = (value: number): string =>
  Number.isFinite(value)
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '--';
