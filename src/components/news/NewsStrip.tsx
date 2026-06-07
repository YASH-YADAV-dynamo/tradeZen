import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTradeableFilteredNews } from '../../store/newsStore';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { NewsCard } from './NewsCard';

/**
 * Horizontal "at-a-glance" headlines for the Markets screen. Filters down to
 * importance ≥ 2 so traders see only meaningful signal, never noise.
 * Limit is intentionally small (6) — the full feed lives behind "See all".
 */
interface Props {
  limit?: number;
  title?: string;
}

export const NewsStrip: React.FC<Props> = ({ limit = 6, title = 'Top news' }) => {
  const router = useRouter();
  const items = useTradeableFilteredNews({ minImportance: 2 });
  const sliced = useMemo(() => items.slice(0, limit), [items, limit]);

  if (sliced.length === 0) return null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={() => router.push('/(tabs)/news')} style={styles.seeAll} hitSlop={6}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.green.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {sliced.map((item) => (
          <NewsCard key={item.id} item={item} variant="carousel" />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { marginBottom: SPACING.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  seeAllText: {
    color: COLORS.green.primary,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  scroll: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
});
