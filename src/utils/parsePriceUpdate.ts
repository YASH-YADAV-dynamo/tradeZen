import type { PriceSnapshot } from '../api/types';
import { parsePriceBook } from './parsePriceBook';

const isFlatPriceMap = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).some(
    ([key, val]) => key.startsWith('0x') && typeof val === 'number' && Number.isFinite(val)
  );
};

const normalizeFlatPrices = (map: Record<string, unknown>): Record<string, number> => {
  const prices: Record<string, number> = {};
  for (const [key, val] of Object.entries(map)) {
    if (key.startsWith('0x') && typeof val === 'number' && Number.isFinite(val)) {
      prices[key.toLowerCase()] = val;
    }
  }
  return prices;
};

/**
 * Normalizes any backend price payload into lowercase address → USD price.
 * Supports v2.1 order books, legacy `{ chain, prices }`, and flat address maps.
 */
export const parsePriceUpdate = (raw: unknown): Record<string, number> => {
  if (!raw || typeof raw !== 'object') return {};

  const obj = raw as Record<string, unknown>;

  if (obj.data && typeof obj.data === 'object') {
    return parsePriceUpdate(obj.data);
  }

  if (isFlatPriceMap(obj.prices)) {
    return normalizeFlatPrices(obj.prices as Record<string, unknown>);
  }

  if (isFlatPriceMap(obj)) {
    return normalizeFlatPrices(obj);
  }

  return parsePriceBook(obj as PriceSnapshot);
};
