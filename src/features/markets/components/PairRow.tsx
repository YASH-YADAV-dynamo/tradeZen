import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Token } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../../core/theme';
import { formatPrice } from '../../../shared/utils';
import { useHaptics } from '../../../shared/hooks';
import { useFavoritesStore } from '../store/useFavoritesStore';

interface PairRowProps {
  token: Token;
  price?: number;
  index: number;
  onPress: (token: Token) => void;
}

export const PairRow: React.FC<PairRowProps> = memo(({ token, price, index, onPress }) => {
  const { onSelect, onTap } = useHaptics();
  const { has, toggle } = useFavoritesStore();
  const isFav = has(token.address);
  const scale = useSharedValue(1);
  const starScale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handlePress = () => {
    onTap();
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onPress(token);
  };

  const sellOnly = token.extensions.availability.canSell && !token.extensions.availability.canBuy;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).duration(280).springify()}
      style={pressStyle}
    >
      <Pressable
        style={styles.row}
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 20 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20 });
        }}
      >
        <View style={styles.badge}>
          <Image source={{ uri: token.logoURI }} style={styles.logo} />
        </View>

        <View style={styles.info}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{token.symbol}</Text>
            {sellOnly ? <Text style={styles.type}>SELL ONLY</Text> : null}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {token.name}
          </Text>
        </View>

        <View style={styles.priceWrap}>
          <Text style={styles.price}>{typeof price === 'number' ? `$${formatPrice(price)}` : '--'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.fav, isFav && styles.favActive]}
          onPress={() => {
            onSelect();
            starScale.value = withSpring(1.28, { damping: 10, stiffness: 420 }, () => {
              starScale.value = withSpring(1, { damping: 12, stiffness: 360 });
            });
            toggle(token.address);
          }}
          hitSlop={10}
        >
          <Animated.View style={starStyle}>
            <Ionicons
              name={isFav ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isFav ? COLORS.amber.primary : COLORS.text.muted}
            />
          </Animated.View>
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border.muted,
    gap: SPACING.sm,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    backgroundColor: COLORS.bg.elevated,
    overflow: 'hidden',
  },
  logo: { width: 40, height: 40 },
  info: { flex: 1, minWidth: 0 },
  symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  symbol: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  type: {
    color: COLORS.text.muted,
    fontSize: 9,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  name: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.muted, marginTop: 2 },
  priceWrap: { alignItems: 'flex-end', gap: 3, minWidth: 78 },
  price: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  fav: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  favActive: { borderColor: COLORS.amber.primary, backgroundColor: COLORS.amber.subtle },
});
