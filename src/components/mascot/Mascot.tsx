import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IS_WEB } from '../../platform';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { useMascotTrigger, type MascotTrigger } from './useMascotState';

type IconName = keyof typeof Ionicons.glyphMap;

const STATE_META: Record<
  MascotTrigger,
  { icon: IconName; label: string; bubble?: string; color?: string }
> = {
  trigger_idle: { icon: 'ellipse-outline', label: 'Idle' },
  trigger_welcome: { icon: 'hand-left-outline', label: 'Welcome', bubble: 'Ready to trade?' },
  trigger_point_down: { icon: 'arrow-down-circle-outline', label: 'Pick a token', bubble: 'Choose your token' },
  trigger_token_confirm: { icon: 'checkmark-circle', label: 'Token set', bubble: 'Nice pick!', color: COLORS.green.primary },
  trigger_signal_alert: { icon: 'radio-outline', label: 'Signal', bubble: 'News signal detected', color: COLORS.amber.primary },
  trigger_loading: { icon: 'sync-outline', label: 'Loading', bubble: 'Working on it...' },
  trigger_pre_confirm: { icon: 'shield-checkmark-outline', label: 'Ready', bubble: 'Quote looks good — confirm?' },
  trigger_success: { icon: 'checkmark-done-circle', label: 'Success', bubble: 'Trade settled!', color: COLORS.green.primary },
  trigger_error: { icon: 'alert-circle-outline', label: 'Error', bubble: "Let's try again", color: COLORS.red.primary },
};

export const Mascot: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const trigger = useMascotTrigger();
  const meta = STATE_META[trigger];
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (IS_WEB) return;
    if (trigger === 'trigger_loading') {
      rotate.value = withRepeat(withTiming(360, { duration: 1200 }), -1, false);
      scale.value = withRepeat(
        withSequence(withTiming(1.06, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
      return;
    }
    rotate.value = withTiming(0, { duration: 200 });
    if (trigger === 'trigger_success') {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
      return;
    }
    if (trigger === 'trigger_error') {
      scale.value = withSequence(withTiming(0.92, { duration: 120 }), withSpring(1));
      return;
    }
    scale.value = withSpring(1);
  }, [trigger, rotate, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const iconColor = meta.color ?? COLORS.green.primary;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Animated.View style={[styles.avatar, animStyle]}>
        <Ionicons name={meta.icon} size={compact ? 22 : 26} color={iconColor} />
      </Animated.View>
      {!compact ? (
        <View style={styles.copy}>
          <Text style={styles.label}>{meta.label}</Text>
          {meta.bubble ? <Text style={styles.bubble}>{meta.bubble}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  wrapCompact: { alignSelf: 'flex-start', marginBottom: SPACING.base },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green.subtle,
  },
  copy: { flex: 1 },
  label: {
    color: COLORS.text.primary,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  bubble: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});
