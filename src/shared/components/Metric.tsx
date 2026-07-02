import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, TYPOGRAPHY } from '../../core/theme';
import { Tone } from '../types';

interface MetricProps {
  label: string;
  value: string;
  tone?: Tone;
}

export const Metric: React.FC<MetricProps> = ({ label, value, tone = 'neutral' }) => (
  <View style={styles.metric}>
    <Text style={styles.label}>{label}</Text>
    <Text
      style={[
        styles.value,
        tone === 'green' && styles.green,
        tone === 'red' && styles.red,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  metric: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    padding: 10,
    backgroundColor: COLORS.bg.secondary,
  },
  label: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs },
  value: { color: COLORS.text.primary, fontWeight: '800', marginTop: 4 },
  green: { color: COLORS.green.primary },
  red: { color: COLORS.red.primary },
});
