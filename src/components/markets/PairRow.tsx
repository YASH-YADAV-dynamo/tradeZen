import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { MarketPair } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../theme';
import { formatPrice } from '../../utils/format';
import { useHaptics } from '../../hooks/useHaptics';
import { useFavoritesStore } from '../../store';

interface PairRowProps {
  pair: MarketPair;
  index: number;
  onPress: (pair: MarketPair) => void;
}

export const PairRow: React.FC<PairRowProps> = memo(({ pair, index, onPress }) => {
  const { onSelect, onTap } = useHaptics();
  const { has, toggle } = useFavoritesStore();
  const isFav = has(pair.symbol);
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
    onPress(pair);
  };

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
          <Image source={{ uri: pair.logo }} style={styles.logo} />
        </View>

        <View style={styles.info}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{pair.base}</Text>
            <Text style={styles.type}>{pair.assetType.toUpperCase()}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {pair.name}
          </Text>
        </View>

        <View style={styles.priceWrap}>
          <Text style={styles.price}>
            {typeof pair.price === 'number' ? `$${formatPrice(pair.price)}` : '--'}
          </Text>
          {pair.isTradingHalted ? (
            <Text style={styles.halted}>HALTED</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.fav, isFav && styles.favActive]}
          onPress={() => {
            onSelect();
            starScale.value = withSpring(1.28, { damping: 10, stiffness: 420 }, () => {
              starScale.value = withSpring(1, { damping: 12, stiffness: 360 });
            });
            toggle(pair.symbol);
          }}
          hitSlop={10}
        >
          <Animated.View style={starStyle}>
            <Ionicons
              name={isFav ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isFav ? '#F9A825' : COLORS.text.muted}
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
  logo: {
    width: 40,
    height: 40,
  },
  info: { flex: 1, minWidth: 0 },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
  name: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  priceWrap: { alignItems: 'flex-end', gap: 3, minWidth: 78 },
  price: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  halted: {
    color: COLORS.red.primary,
    fontSize: 10,
    fontWeight: '700',
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
  favActive: {
    borderColor: '#F9A825',
    backgroundColor: 'rgba(249, 168, 37, 0.12)',
  },
});
