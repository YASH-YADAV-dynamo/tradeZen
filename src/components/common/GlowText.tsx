import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '../../theme';

interface GlowTextProps extends TextProps {
  children: React.ReactNode;
  glowColor?: string;
}

export const GlowText: React.FC<GlowTextProps> = ({
  children,
  glowColor = COLORS.green.primary,
  style,
  ...props
}) => {
  const glow = useSharedValue(0.2);

  React.useEffect(() => {
    glow.value = withTiming(0.8, { duration: 300 });
  }, [glow]);

  const animStyle = useAnimatedStyle(() => ({
    textShadowColor: glowColor,
    textShadowRadius: glow.value * 12,
    textShadowOffset: { width: 0, height: 0 },
  }));

  return (
    <Animated.Text {...props} style={[styles.text, animStyle, style]}>
      {children}
    </Animated.Text>
  );
};

export const ChangeBadge: React.FC<{
  label: string;
  type: 'up' | 'down';
  size?: 'sm' | 'md';
}> = ({ label, type, size = 'md' }) => {
  const positive = type === 'up';
  return (
    <Text
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        positive ? styles.up : styles.down,
      ]}
    >
      {label}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  badge: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  badgeSm: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  up: { color: COLORS.green.primary },
  down: { color: COLORS.red.primary },
});
