import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';

export type FilterCategory = 'all' | 'favorites' | 'stocks' | 'etfs';

const FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Watchlist' },
  { key: 'stocks', label: 'Stocks' },
  { key: 'etfs', label: 'ETFs' },
];

interface FilterBarProps {
  active: FilterCategory;
  onChange: (f: FilterCategory) => void;
  showEtfs: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ active, onChange, showEtfs }) => {
  const { onSelect } = useHaptics();
  const filters = FILTERS.filter((filter) => showEtfs || filter.key !== 'etfs');

  return (
    <View style={styles.container}>
      {filters.map((f) => {
        const isActive = f.key === active;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => {
              onSelect();
              onChange(f.key);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: 6,
    flexDirection: 'row',
  },
  pill: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: COLORS.green.dim,
    borderColor: COLORS.green.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.muted,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  labelActive: {
    color: COLORS.green.primary,
  },
});
