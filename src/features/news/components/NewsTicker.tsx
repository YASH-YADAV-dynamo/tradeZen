import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../core/theme';
import { NewsItem } from '../types';

interface NewsTickerProps {
  items: NewsItem[];
}

const SENTIMENT_COLOR: Record<NewsItem['sentiment'], string> = {
  bullish: COLORS.green.primary,
  bearish: COLORS.red.primary,
  neutral: COLORS.text.muted,
};

export const NewsTicker: React.FC<NewsTickerProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <FlatList
      data={items.slice(0, 10)}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={[styles.dot, { backgroundColor: SENTIMENT_COLOR[item.sentiment] }]} />
            <Text style={styles.source}>{item.source}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: SPACING.base, gap: 8, paddingBottom: SPACING.sm },
  card: {
    width: 220,
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  source: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700' },
  title: { color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600' },
});
