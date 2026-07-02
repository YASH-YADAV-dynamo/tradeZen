import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../../core/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewProps['style'];
  scrollProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle' | 'children'>;
}

/**
 * Every tab screen previously re-implemented "padding-top: max(insets.top, SPACING.sm)
 * + flex-1 + bg.primary" by hand. Centralizing it here means safe-area and
 * background handling stays consistent across iOS notches, Android status
 * bars, and web — and changing it once changes it everywhere.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scroll = false,
  contentStyle,
  scrollProps,
}) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = Math.max(top, SPACING.sm);

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, { paddingTop }]}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, { paddingTop }, contentStyle]}>{children}</View>;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 196,
  },
});
