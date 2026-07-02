import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '../../../shared/components';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../core/theme';

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: 'green' | 'red' | 'neutral';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, tone = 'neutral' }) => (
  <GlassCard padding={12} style={styles.card}>
    <Text style={styles.label}>{label}</Text>
    <Text
      style={[styles.value, tone === 'green' && styles.green, tone === 'red' && styles.red]}
    >
      {value}
    </Text>
  </GlassCard>
);

const styles = StyleSheet.create({
  card: { flex: 1 },
  label: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700' },
  value: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    marginTop: 6,
  },
  green: { color: COLORS.green.primary },
  red: { color: COLORS.red.primary },
});
