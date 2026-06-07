import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { IS_NATIVE } from './index';
import { COLORS } from '../theme';

interface BlurSurfaceProps {
  intensity?: number;
  tint?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Cross-platform blur surface.
 * - Native: expo-blur BlurView
 * - Web: solid translucent fallback (avoids broken backdrop-filter perf)
 */
export const BlurSurface: React.FC<BlurSurfaceProps> = ({
  intensity = 40,
  tint = 'dark',
  style,
  children,
}) => {
  if (IS_NATIVE) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const { BlurView } = require('expo-blur') as typeof import('expo-blur');
    return (
      <BlurView intensity={intensity} tint={tint} style={style}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.webFallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: COLORS.bg.secondary,
  },
});
