import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import type { NewsSentiment } from '../../api/types';
import { COLORS, FONTS, RADIUS, TYPOGRAPHY } from '../../theme';

const sentimentColors: Record<NewsSentiment, { fg: string; bg: string }> = {
  bullish: { fg: COLORS.green.primary, bg: COLORS.green.subtle },
  bearish: { fg: COLORS.red.primary, bg: COLORS.red.subtle },
  neutral: { fg: COLORS.text.muted, bg: COLORS.bg.elevated },
};

export const SentimentDot: React.FC<{ sentiment: NewsSentiment; size?: number }> = ({
  sentiment,
  size = 8,
}) => (
  <View
    style={[
      styles.dot,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: sentimentColors[sentiment].fg,
      },
    ]}
  />
);

export const SentimentPill: React.FC<{ sentiment: NewsSentiment; style?: ViewStyle }> = ({
  sentiment,
  style,
}) => {
  const palette = sentimentColors[sentiment];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      <SentimentDot sentiment={sentiment} size={6} />
      <Text style={[styles.pillText, { color: palette.fg }]}>{sentiment}</Text>
    </View>
  );
};

export const BreakingPill: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.breaking, style]}>
    <Text style={styles.breakingText}>BREAKING</Text>
  </View>
);

export const ImportantPill: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.important, style]}>
    <Text style={styles.importantText}>IMPORTANT</Text>
  </View>
);

const styles = StyleSheet.create({
  dot: { backgroundColor: COLORS.text.muted },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  pillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontFamily: FONTS.bodyBold,
    textTransform: 'capitalize',
  },
  breaking: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.red.primary,
  },
  breakingText: {
    fontSize: 9,
    color: COLORS.bg.primary,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.6,
  },
  important: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.amber.primary,
  },
  importantText: {
    fontSize: 9,
    color: COLORS.bg.primary,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.6,
  },
});
