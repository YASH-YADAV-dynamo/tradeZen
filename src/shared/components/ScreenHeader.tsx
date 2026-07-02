import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../core/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  heading: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.heading,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 3,
  },
});
