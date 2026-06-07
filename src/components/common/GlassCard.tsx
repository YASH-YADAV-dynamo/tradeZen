import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS, RADIUS, SHADOWS } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  glow?: 'green' | 'red' | 'none';
  padding?: number;
}

/**
 * Static card surface. Press feedback uses Pressable's built-in
 * pressed state (no Reanimated worklets) to stay light on web.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  glow = 'none',
  padding = 16,
}) => {
  const borderColor =
    glow === 'green'
      ? COLORS.green.dim
      : glow === 'red'
      ? COLORS.red.dim
      : COLORS.border.default;

  const shadowStyle =
    glow === 'green'
      ? SHADOWS.green
      : glow === 'red'
      ? SHADOWS.red
      : SHADOWS.card;

  const cardStyle = [styles.card, { padding, borderColor }, shadowStyle, style];

  if (!onPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
});
