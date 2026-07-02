import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme';
import { useHaptics } from '../hooks';

type ButtonVariant = 'outline' | 'pill' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: 'tap' | 'select' | 'none';
}

/**
 * Consolidates what used to be three near-identical hand-rolled pressables
 * (the portfolio "Close at Market" button, the settings chain selector, and
 * the markets filter pills) into one themeable primitive.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'outline',
  size = 'md',
  active = false,
  disabled = false,
  fullWidth = false,
  style,
  haptic = 'select',
}) => {
  const { onTap, onSelect } = useHaptics();

  const handlePress = () => {
    if (disabled) return;
    if (haptic === 'tap') onTap();
    if (haptic === 'select') onSelect();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        variant === 'outline' && styles.outline,
        variant === 'pill' && styles.pill,
        variant === 'pill' && active && styles.pillActive,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'pill' && active && styles.labelActive,
          variant === 'outline' && styles.outlineLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: 'transparent',
  },
  sm: { minHeight: 36, paddingHorizontal: 6, paddingVertical: 8 },
  md: { minHeight: 42, paddingHorizontal: SPACING.base },
  outline: { borderColor: COLORS.border.accent },
  outlineLabel: { color: COLORS.text.primary },
  pill: { backgroundColor: COLORS.bg.secondary },
  pillActive: { backgroundColor: COLORS.green.dim, borderColor: COLORS.green.primary },
  ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.muted,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  labelActive: { color: COLORS.green.primary },
});
