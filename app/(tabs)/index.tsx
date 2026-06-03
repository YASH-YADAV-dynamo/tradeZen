import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMarketPairs } from '../../src/api/hooks';
import { PairRow } from '../../src/components/markets/PairRow';
import { FilterBar, FilterCategory } from '../../src/components/markets/FilterBar';
import { PairRowSkeleton } from '../../src/components/common/Skeleton';
import { useFavoritesStore } from '../../src/store';
import { MarketPair } from '../../src/types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../src/theme';

interface SearchableMarket {
  pair: MarketPair;
  haystack: string;
  base: string;
  symbol: string;
  name: string;
}

const normalizeSearch = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getCharacterRank = (candidate: string, query: string) => {
  let cursor = 0;
  let firstMatch = -1;
  let gaps = 0;

  for (const char of query) {
    const index = candidate.indexOf(char, cursor);
    if (index === -1) return Number.POSITIVE_INFINITY;
    if (firstMatch === -1) firstMatch = index;
    gaps += index - cursor;
    cursor = index + 1;
  }

  return 20 + firstMatch * 2 + gaps + candidate.length * 0.01;
};

const scoreMarket = (market: SearchableMarket, query: string) => {
  if (!query) return 0;
  if (market.base === query || market.symbol === query) return 0;
  if (market.base.startsWith(query) || market.symbol.startsWith(query)) return 1;
  if (market.name.startsWith(query)) return 2;
  if (market.haystack.includes(query)) return 4 + market.haystack.indexOf(query) * 0.01;
  return getCharacterRank(market.haystack, query);
};

export default function MarketsScreen() {
  const { top } = useSafeAreaInsets();
  const { favorites } = useFavoritesStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');

  const marketPairsQuery = useMarketPairs();
  const pairs = marketPairsQuery.data as MarketPair[] | undefined;
  const { isLoading, isRefetching, refetch } = marketPairsQuery;
  const counts = useMemo(() => {
    const list = pairs ?? [];
    return {
      total: list.length,
      stocks: list.filter((pair) => pair.assetType === 'stock').length,
      etfs: list.filter((pair) => pair.assetType === 'etf').length,
    };
  }, [pairs]);
  const showEtfs = counts.etfs > 0;
  const query = search.trim().toLowerCase();
  const normalizedQuery = useMemo(() => normalizeSearch(query), [query]);
  const searchablePairs = useMemo<SearchableMarket[]>(
    () =>
      (pairs ?? []).map((pair) => {
        const base = normalizeSearch(pair.base);
        const symbol = normalizeSearch(pair.symbol);
        const name = normalizeSearch(pair.name);
        return {
          pair,
          base,
          symbol,
          name,
          haystack: `${base}${symbol}${name}`,
        };
      }),
    [pairs]
  );

  useEffect(() => {
    if (filter === 'etfs' && !showEtfs) setFilter('all');
  }, [filter, showEtfs]);

  const filtered = useMemo<MarketPair[]>(() => {
    let list = searchablePairs;

    if (filter === 'favorites') {
      list = list.filter(({ pair }) => favorites.includes(pair.symbol));
    } else if (filter === 'etfs') {
      list = list.filter(({ pair }) => pair.assetType === 'etf');
    } else if (filter === 'stocks') {
      list = list.filter(({ pair }) => pair.assetType === 'stock');
    }

    if (normalizedQuery) {
      return list
        .map((market) => ({ market, rank: scoreMarket(market, normalizedQuery) }))
        .filter(({ rank }) => Number.isFinite(rank))
        .sort(
          (a, b) =>
            a.rank - b.rank ||
            a.market.base.length - b.market.base.length ||
            a.market.pair.base.localeCompare(b.market.pair.base)
        )
        .map(({ market }) => market.pair);
    }
    return list.map(({ pair }) => pair);
  }, [searchablePairs, filter, normalizedQuery, favorites]);

  const handlePairPress = useCallback(
    (_pair: MarketPair) => {
      // Trading is temporarily disabled; keep rows visible without opening Trade.
    },
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MarketPair; index: number }) => (
      <PairRow pair={item} index={index} onPress={handlePairPress} />
    ),
    [handlePairPress]
  );

  return (
    <View style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Markets</Text>
          {counts.total > 0 && (
            <Text style={styles.subheading}>
              <Text style={{ color: COLORS.text.primary }}>{counts.total} markets</Text>
              <Text style={{ color: COLORS.text.muted }}>
                {' '}· {counts.stocks} stocks{showEtfs ? ` · ${counts.etfs} ETFs` : ''}
              </Text>
            </Text>
          )}
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.search}
          placeholder="Search markets..."
          placeholderTextColor={COLORS.text.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FilterBar active={filter} onChange={setFilter} showEtfs={showEtfs} />

      <View style={styles.sep} />

      {isLoading ? (
        <View>
          {Array.from({ length: 8 }).map((_, i) => (
            <PairRowSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.symbol}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 70,
            offset: 70 * index,
            index,
          })}
          windowSize={10}
          maxToRenderPerBatch={12}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.green.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No markets found</Text>
              <Text style={styles.emptyBody}>
                {search ? `No results for "${search}"` : 'Check back soon'}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 184 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  heading: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.heading,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 3,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.base,
    height: 46,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bg.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  searchIcon: {
    fontSize: 16,
    color: COLORS.text.muted,
    marginRight: 8,
  },
  search: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  sep: {
    height: 1,
    backgroundColor: COLORS.border.muted,
    marginBottom: 0,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
    marginTop: 10,
  },
  emptyBody: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
});
