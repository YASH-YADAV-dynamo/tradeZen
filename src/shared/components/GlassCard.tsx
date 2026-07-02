import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { COLORS, RADIUS, SHADOWS } from '../../core/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

/**
 * Static glass-panel container used throughout the app. An earlier version
 * also supported a pressable/animated variant and colored "glow" borders,
 * but nothing in the app used them, so this stays to just what's exercised:
 * padding, style, children.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, style, padding = 16 }) => (
  <View style={[styles.card, { padding }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    ...SHADOWS.card,
  },
});
