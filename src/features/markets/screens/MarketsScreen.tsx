import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, RefreshControl } from 'react-native';

import { useTokens, useLivePrices, priceForAddress } from '../hooks';
import { PairRow, FilterBar, FilterCategory } from '../components';
import { PairRowSkeleton, ScreenContainer, ScreenHeader, EmptyState } from '../../../shared/components';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useDebouncedValue } from '../../../shared/hooks';
import { Token } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../../core/theme';
import { normalizeSearch, searchTokens, toSearchableToken } from '../utils';
import { useWalletStore } from '../../wallet/store/useWalletStore';
import { useAuthSession } from '../../auth/hooks';
import { useNews, useLiveNews } from '../../news/hooks';
import { NewsTicker } from '../../news/components';
import { useTradeSheetStore } from '../../trade/store/useTradeSheetStore';
import { TradeSheet } from '../../trade/components/TradeSheet';

const ROW_HEIGHT = 70;
const LIST_BOTTOM_PADDING = 184;
const SKELETON_ROWS = 8;

export const MarketsScreen: React.FC = () => {
  const chain = useWalletStore((state) => state.chain);
  const { favorites } = useFavoritesStore();
  const { session } = useAuthSession();
  const openTradeSheet = useTradeSheetStore((state) => state.open);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const debouncedSearch = useDebouncedValue(search, 120);

  const tokensQuery = useTokens(chain);
  const tokens = Array.isArray(tokensQuery.data) ? tokensQuery.data : [];
  const pricesQuery = useLivePrices(chain);

  const news = useNews();
  useLiveNews(session?.token);

  const normalizedQuery = useMemo(() => normalizeSearch(debouncedSearch.trim()), [debouncedSearch]);
  const searchableTokens = useMemo(() => tokens.map(toSearchableToken), [tokens]);

  const filtered = useMemo<Token[]>(() => {
    let list = searchableTokens;
    if (filter === 'favorites') {
      list = list.filter(({ token }) => favorites.includes(token.address));
    }
    return searchTokens(list, normalizedQuery);
  }, [searchableTokens, filter, normalizedQuery, favorites]);

  const sellCandidates = useMemo(
    () => tokens.filter((token) => token.extensions.availability.canSell),
    [tokens]
  );

  const handleTokenPress = useCallback(
    (token: Token) => openTradeSheet(token),
    [openTradeSheet]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Token; index: number }) => (
      <PairRow
        token={item}
        price={priceForAddress(pricesQuery.data, item.address)}
        index={index}
        onPress={handleTokenPress}
      />
    ),
    [pricesQuery.data, handleTokenPress]
  );

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Markets"
        subtitle={tokens.length > 0 ? `${tokens.length} tokens on ${chain}` : undefined}
      />

      <NewsTicker items={news.data ?? []} />

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

      <FilterBar active={filter} onChange={setFilter} />

      <View style={styles.sep} />

      {tokensQuery.isLoading ? (
        <View style={styles.listArea}>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <PairRowSkeleton key={i} />
          ))}
        </View>
      ) : tokensQuery.isError ? (
        <View style={styles.listArea}>
          <EmptyState title="Couldn't load markets" body={tokensQuery.error.message} />
        </View>
      ) : (
        <FlatList
          style={styles.listArea}
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.address}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: ROW_HEIGHT,
            offset: ROW_HEIGHT * index,
            index,
          })}
          windowSize={10}
          maxToRenderPerBatch={12}
          refreshControl={
            <RefreshControl
              refreshing={tokensQuery.isRefetching}
              onRefresh={tokensQuery.refetch}
              tintColor={COLORS.green.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No markets found"
              body={search ? `No results for "${search}"` : 'Check back soon'}
            />
          }
          contentContainerStyle={{ paddingBottom: LIST_BOTTOM_PADDING }}
        />
      )}

      <TradeSheet sellCandidates={sellCandidates} chain={chain} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  searchIcon: { fontSize: 16, color: COLORS.text.muted, marginRight: 8 },
  search: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  sep: { height: 1, backgroundColor: COLORS.border.muted, marginBottom: 0 },
  listArea: { flex: 1 },
});
