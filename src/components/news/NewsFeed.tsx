import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { NewsItem } from '../../api/types';
import { useAllNews } from '../../api/hooks/useNews';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useTradeableFilteredNews } from '../../store/newsStore';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { NewsCard } from './NewsCard';
import { NewsFilterChips, NewsTab, tabToFilter } from './NewsFilterChips';

/**
 * Full news feed (Markets → "See all" or /news tab). Filters and search are
 * 100% client-side — the in-memory cache from useNewsFeed() is enough.
 */
interface Props {
  /** Header content above the chips (e.g. a screen title). */
  ListHeader?: React.ReactElement;
  /** Pre-applied symbol filter — used by the token detail screen. */
  initialSymbols?: string[];
}

export const NewsFeed: React.FC<Props> = ({ ListHeader, initialSymbols }) => {
  const [tab, setTab] = useState<NewsTab>(initialSymbols?.length ? 'all' : 'all');
  const [query, setQuery] = useState('');
  const watchlist = useFavoritesStore((s) => s.favorites);

  const filter = useMemo(() => {
    const base = tabToFilter(tab, { watchlistSymbols: watchlist });
    return {
      ...base,
      symbols: initialSymbols?.length ? initialSymbols : base.symbols,
      search: query.trim() || undefined,
    };
  }, [tab, watchlist, initialSymbols, query]);

  const items = useTradeableFilteredNews(filter);
  const restQuery = useAllNews();

  const renderItem: ListRenderItem<NewsItem> = ({ item }) => <NewsCard item={item} variant="feed" />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={restQuery.isFetching && !restQuery.isLoading}
          onRefresh={() => restQuery.refetch()}
          tintColor={COLORS.green.primary}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View>
          {ListHeader}
          {!initialSymbols?.length ? (
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={COLORS.text.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search headlines, tickers"
                placeholderTextColor={COLORS.text.muted}
                style={styles.search}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={6}>
                  <Ionicons name="close-circle" size={16} color={COLORS.text.muted} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {!initialSymbols?.length ? (
            <NewsFilterChips
              value={tab}
              onChange={setTab}
              hasWatchlist={watchlist.length > 0}
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        restQuery.isLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={COLORS.green.primary} />
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={28} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>No news yet</Text>
            <Text style={styles.emptyHint}>
              {query
                ? 'No headlines match your search.'
                : tab === 'watchlist'
                  ? 'Add favourites in the markets list to follow them here.'
                  : 'New stories will appear here as soon as a provider publishes.'}
            </Text>
          </View>
        )
      }
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.bg.elevated,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    height: 44,
    marginVertical: SPACING.sm,
  },
  search: {
    flex: 1,
    color: COLORS.text.primary,
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.sizes.sm,
    height: '100%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  emptyHint: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
