import React from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, RADIUS } from '../../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = RADIUS.xs,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: COLORS.bg.elevated },
        animStyle,
        style,
      ]}
    />
  );
};

export const PairRowSkeleton: React.FC = () => (
  <View style={styles.row}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <View style={styles.rowContent}>
      <Skeleton width={80} height={14} />
      <Skeleton width={120} height={11} style={{ marginTop: 6 }} />
    </View>
    <View style={styles.rowRight}>
      <Skeleton width={70} height={14} />
      <Skeleton width={50} height={11} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowContent: { flex: 1, gap: 0 },
  rowRight: { alignItems: 'flex-end' },
});
