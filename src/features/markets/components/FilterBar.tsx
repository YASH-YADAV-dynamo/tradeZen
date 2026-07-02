import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SPACING } from '../../../core/theme';
import { Button } from '../../../shared/components';

export type FilterCategory = 'all' | 'favorites';

const FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Watchlist' },
];

interface FilterBarProps {
  active: FilterCategory;
  onChange: (f: FilterCategory) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ active, onChange }) => (
  <View style={styles.container}>
    {FILTERS.map((f) => (
      <Button
        key={f.key}
        label={f.label}
        variant="pill"
        size="sm"
        active={f.key === active}
        onPress={() => onChange(f.key)}
        style={styles.pill}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: 6,
    flexDirection: 'row',
  },
  pill: { flex: 1 },
});
