import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, RADIUS, SHADOWS } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glow?: 'green' | 'red' | 'none';
  padding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  glow = 'none',
  padding = 16,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  if (!onPress) {
    return (
      <View style={[styles.card, { padding, borderColor }, shadowStyle, style]}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={[styles.card, { padding, borderColor }, shadowStyle, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bg.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
});
