import React, { memo, useCallback } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useHaptics } from '../../hooks/useHaptics';
import { useFavoritesStore } from '../../store/favoritesStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import type { MarketPair } from '../../types/market';
import { formatPrice } from '../../utils/format';

interface PairRowProps {
  pair: MarketPair;
  onPress: (pair: MarketPair) => void;
}

const sideLabel = (pair: MarketPair) => {
  if (pair.canBuy && pair.canSell) return 'SWAP';
  if (pair.canBuy) return 'BUY';
  return 'SELL';
};

const PairRowComponent: React.FC<PairRowProps> = ({ pair, onPress }) => {
  const { onSelect, onTap } = useHaptics();
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFav = useFavoritesStore((s) => s.favorites.includes(pair.symbol));

  const handlePress = useCallback(() => {
    onTap();
    onPress(pair);
  }, [onTap, onPress, pair]);

  const handleFav = useCallback(() => {
    onSelect();
    toggle(pair.symbol);
  }, [onSelect, toggle, pair.symbol]);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={handlePress}
    >
      <View style={styles.badge}>
        <Image source={{ uri: pair.logo }} style={styles.logo} />
      </View>

      <View style={styles.info}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{pair.symbol}</Text>
          <Text style={styles.side}>{sideLabel(pair)}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {pair.name}
        </Text>
      </View>

      <View style={styles.priceWrap}>
        <Text style={styles.price}>
          {typeof pair.price === 'number' ? `$${formatPrice(pair.price)}` : '--'}
        </Text>
        {pair.isTradingHalted ? <Text style={styles.halted}>HALTED</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.fav, isFav && styles.favActive]}
        onPress={handleFav}
        hitSlop={10}
      >
        <Ionicons
          name={isFav ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={isFav ? '#F9A825' : COLORS.text.muted}
        />
      </TouchableOpacity>
    </Pressable>
  );
};

const arePropsEqual = (prev: PairRowProps, next: PairRowProps): boolean =>
  prev.pair.address === next.pair.address &&
  prev.pair.price === next.pair.price &&
  prev.pair.canBuy === next.pair.canBuy &&
  prev.pair.canSell === next.pair.canSell &&
  prev.pair.isTradingHalted === next.pair.isTradingHalted &&
  prev.onPress === next.onPress;

export const PairRow = memo(PairRowComponent, arePropsEqual);

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
  rowPressed: { backgroundColor: COLORS.bg.secondary },
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
  side: {
    color: COLORS.text.muted,
    fontSize: 9,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  name: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.muted, marginTop: 2 },
  priceWrap: { alignItems: 'flex-end', gap: 3, minWidth: 78 },
  price: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  halted: { color: COLORS.red.primary, fontSize: 10, fontWeight: '700' },
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
