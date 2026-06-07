import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { NewsAssetType } from '../../api/types';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

export type NewsTab =
  | 'all'
  | 'watchlist'
  | 'breaking'
  | 'crypto'
  | 'stock'
  | 'etf'
  | 'macro';

interface Props {
  value: NewsTab;
  onChange: (next: NewsTab) => void;
  hasWatchlist?: boolean;
}

const tabs: { id: NewsTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'breaking', label: 'Breaking' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'stock', label: 'Stocks' },
  { id: 'etf', label: 'ETFs' },
  { id: 'macro', label: 'Macro' },
];

export const NewsFilterChips: React.FC<Props> = ({ value, onChange, hasWatchlist = true }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {tabs.map((tab) => {
        if (tab.id === 'watchlist' && !hasWatchlist) return null;
        const active = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

/**
 * Maps a NewsTab → filter input for `filterNews()`. Keeps the consumer
 * component (the feed screen) free of conditional filter logic.
 */
export function tabToFilter(
  tab: NewsTab,
  opts: { watchlistSymbols: string[] }
): { minImportance?: 2 | 3; assetTypes?: NewsAssetType[]; symbols?: string[] } {
  switch (tab) {
    case 'breaking':
      return { minImportance: 3 };
    case 'crypto':
      return { assetTypes: ['crypto'] };
    case 'stock':
      return { assetTypes: ['stock'] };
    case 'etf':
      return { assetTypes: ['etf'] };
    case 'macro':
      return { assetTypes: ['macro'] };
    case 'watchlist':
      return { symbols: opts.watchlistSymbols };
    case 'all':
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: SPACING.base, gap: SPACING.sm, paddingVertical: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.elevated,
  },
  chipActive: {
    backgroundColor: COLORS.green.subtle,
    borderColor: COLORS.green.primary,
  },
  chipText: {
    color: COLORS.text.secondary,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.3,
  },
  chipTextActive: { color: COLORS.green.primary },
});
