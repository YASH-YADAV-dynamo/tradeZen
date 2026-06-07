import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

interface DetailRowProps {
  label: string;
  value: string;
  sub?: string;
}

/** Label/value row used in quote confirmation and similar summaries. */
export const DetailRow: React.FC<DetailRowProps> = ({ label, value, sub }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.right}>
      <Text style={styles.value}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.base,
    marginBottom: 10,
  },
  label: { color: COLORS.text.muted, fontWeight: '700' },
  right: { alignItems: 'flex-end', flex: 1 },
  value: { color: COLORS.text.primary, fontWeight: '800' },
  sub: {
    color: COLORS.text.muted,
    textDecorationLine: 'line-through',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});
