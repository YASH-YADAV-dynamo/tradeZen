import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMarketPairs } from '../../src/api/hooks';
import { getApiBaseUrl } from '../../src/utils/apiUrl';
import { PairRow } from '../../src/components/markets/PairRow';
import { FilterBar, FilterCategory } from '../../src/components/markets/FilterBar';
import { PairRowSkeleton } from '../../src/components/common/Skeleton';
import { NewsStrip } from '../../src/components/news/NewsStrip';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { MarketPair } from '../../src/types/market';
import { filterMarkets } from '../../src/utils/marketSearch';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../src/theme';
import { ConnectWalletModal, useWallet } from '../../src/wallet';

const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function MarketsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const favorites = useFavoritesStore((s) => s.favorites);
  const wallet = useWallet();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showConnect, setShowConnect] = useState(false);

  const { data: pairs, isLoading, isRefetching, isError, error, refetch } = useMarketPairs();

  const counts = useMemo(() => {
    const list = pairs ?? [];
    return {
      total: list.length,
      buy: list.filter((p) => p.canBuy).length,
      sell: list.filter((p) => p.canSell).length,
    };
  }, [pairs]);

  const showSell = counts.sell > 0;

  useEffect(() => {
    if (filter === 'sell' && !showSell) setFilter('all');
  }, [filter, showSell]);

  const filtered = useMemo(
    () =>
      filterMarkets(pairs ?? [], {
        filter,
        favorites,
        query: search,
      }),
    [pairs, filter, favorites, search]
  );

  const handlePairPress = useCallback(
    (pair: MarketPair) => router.push(`/token/${pair.symbol}`),
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: MarketPair }) => (
      <PairRow pair={item} onPress={handlePairPress} />
    ),
    [handlePairPress]
  );

  return (
    <View style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Markets</Text>
          {counts.total > 0 && (
            <Text style={styles.subheading}>
              <Text style={{ color: COLORS.text.primary }}>{counts.total} tokens</Text>
              <Text style={{ color: COLORS.text.muted }}>
                {' '}· {counts.buy} buy{showSell ? ` · ${counts.sell} sell` : ''}
              </Text>
            </Text>
          )}
        </View>
        <Pressable
          style={[styles.walletPill, wallet.address ? styles.walletPillOn : styles.walletPillOff]}
          onPress={() => setShowConnect(true)}
        >
          <View
            style={[
              styles.walletDot,
              { backgroundColor: wallet.address ? COLORS.green.primary : COLORS.text.muted },
            ]}
          />
          <Text style={styles.walletPillText}>
            {wallet.address ? shorten(wallet.address) : 'Connect'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={COLORS.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search tokens..."
          placeholderTextColor={COLORS.text.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <FilterBar active={filter} onChange={setFilter} showSell={showSell} />

      <View style={styles.sep} />

      {isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Could not load tokens</Text>
          <Text style={styles.emptyBody}>
            {error instanceof Error ? error.message : 'Backend unreachable'}
          </Text>
          <Text style={styles.apiHint}>API: {getApiBaseUrl()}</Text>
          <Text style={styles.emptyBody}>Pull down to retry after starting the Go backend.</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, i) => (
            <PairRowSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.address}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          maxToRenderPerBatch={12}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={COLORS.green.primary}
            />
          }
          ListHeaderComponent={
            search.length === 0 && filter === 'all' ? <NewsStrip /> : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No tokens found</Text>
              <Text style={styles.emptyBody}>
                {search ? `No results for "${search}"` : 'Check back soon'}
              </Text>
            </View>
          }
          contentContainerStyle={
            filtered.length === 0 ? styles.emptyList : styles.listContent
          }
        />
      )}

      <ConnectWalletModal visible={showConnect} onClose={() => setShowConnect(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },
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
  subheading: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 3 },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  walletPillOn: {
    backgroundColor: COLORS.green.subtle,
    borderColor: COLORS.green.primary,
  },
  walletPillOff: {
    backgroundColor: COLORS.bg.secondary,
    borderColor: COLORS.border.default,
  },
  walletDot: { width: 8, height: 8, borderRadius: 4 },
  walletPillText: {
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
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
  searchIcon: { marginRight: 8 },
  search: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  sep: { height: 1, backgroundColor: COLORS.border.muted },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
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
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  apiHint: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 10,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 184 },
  emptyList: { flexGrow: 1, paddingBottom: 184 },
});
