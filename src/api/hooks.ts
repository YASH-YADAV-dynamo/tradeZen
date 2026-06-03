import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';

import xstockAssets from '../constants/xstocks.json';
import {
  MarketPair,
  XChangeAssetConfig,
  XChangeQuote,
  XChangeQuoteRequest,
  XStockAsset,
} from '../types';
import { xstocksApi } from './client';

export const queryClient = new QueryClient();

interface AssetsResponse {
  nodes?: XStockAsset[];
}

interface PriceDataResponse {
  quote?: number;
}

const staticAssets = xstockAssets as XStockAsset[];

const normalizeAsset = (asset: any): XStockAsset => ({
  symbol: asset.symbol,
  name: asset.name,
  underlyingSymbol: asset.underlyingSymbol,
  logo: asset.logo,
  type: asset.type ?? 'stock',
  isTradingHalted: Boolean(asset.isTradingHalted),
  networks: Array.isArray(asset.networks)
    ? asset.networks
    : Array.from(new Set((asset.deployments ?? []).map((d: any) => d.network))).sort(),
  supportsAtomicSwaps: Boolean(
    asset.supportsAtomicSwaps ??
      (asset.deployments ?? []).some((d: any) => d.supportsAtomicSwaps)
  ),
});

const getAssets = async (): Promise<XStockAsset[]> => {
  try {
    const { data } = await xstocksApi.get<AssetsResponse>('/public/assets');
    const nodes = Array.isArray(data) ? data : data.nodes;
    if (!nodes?.length) return staticAssets;
    return nodes.map(normalizeAsset).sort((a, b) =>
      a.underlyingSymbol.localeCompare(b.underlyingSymbol)
    );
  } catch {
    return staticAssets;
  }
};

const getQuote = async (symbol: string): Promise<number | undefined> => {
  try {
    const { data } = await xstocksApi.get<PriceDataResponse>(
      `/public/assets/${symbol}/price-data`
    );
    return typeof data.quote === 'number' ? data.quote : undefined;
  } catch {
    return undefined;
  }
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> => {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await Promise.resolve(mapper(items[index]))
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));
    }
  });

  await Promise.all(workers);
  return results;
};

export const fetchMarketPairs = async (): Promise<MarketPair[]> => {
  const assets = await getAssets();
  const quotes = await mapWithConcurrency(assets, 12, (asset) => getQuote(asset.symbol));

  return assets.map((asset, index) => ({
    symbol: asset.symbol,
    base: asset.underlyingSymbol,
    name: asset.name,
    logo: asset.logo,
    assetType: asset.type,
    price:
      quotes[index].status === 'fulfilled' ? quotes[index].value : undefined,
    isTradingHalted: asset.isTradingHalted,
    networks: asset.networks,
    supportsAtomicSwaps: asset.supportsAtomicSwaps,
  }));
};

export const useMarketPairs = () =>
  useQuery<MarketPair[]>({
    queryKey: ['marketPairs'],
    queryFn: fetchMarketPairs,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

const authConfig = (apiKey: string) => ({
  headers: { 'X-API-KEY': apiKey.trim() },
});

export const fetchXChangeAsset = async (
  identifier: string,
  apiKey: string
): Promise<XChangeAssetConfig> => {
  const { data } = await xstocksApi.get<XChangeAssetConfig>(
    `/trades/xchange/assets/${encodeURIComponent(identifier)}`,
    authConfig(apiKey)
  );
  return data;
};

export const createXChangeQuote = async (
  apiKey: string,
  payload: XChangeQuoteRequest
): Promise<XChangeQuote> => {
  const { data } = await xstocksApi.post<XChangeQuote>(
    '/trades/xchange/rfq',
    payload,
    authConfig(apiKey)
  );
  return data;
};

export const fetchXChangeQuote = async (
  quoteId: string,
  apiKey: string
): Promise<XChangeQuote> => {
  const { data } = await xstocksApi.get<XChangeQuote>(
    `/trades/xchange/quote/${quoteId}`,
    authConfig(apiKey)
  );
  return data;
};

export const useXChangeAsset = (identifier: string | undefined, apiKey: string) =>
  useQuery<XChangeAssetConfig>({
    queryKey: ['xchangeAsset', identifier, Boolean(apiKey)],
    queryFn: () => fetchXChangeAsset(identifier!, apiKey),
    enabled: Boolean(identifier && apiKey.trim()),
    staleTime: 15_000,
  });

export const useCreateXChangeQuote = (apiKey: string) =>
  useMutation({
    mutationFn: (payload: XChangeQuoteRequest) => createXChangeQuote(apiKey, payload),
  });

export const useXChangeQuoteStatus = (
  quoteId: string | undefined,
  apiKey: string
) =>
  useQuery<XChangeQuote>({
    queryKey: ['xchangeQuote', quoteId, Boolean(apiKey)],
    queryFn: () => fetchXChangeQuote(quoteId!, apiKey),
    enabled: Boolean(quoteId && apiKey.trim()),
    refetchInterval: 10_000,
  });
