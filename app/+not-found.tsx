import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../src/core/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.body}>This route does not exist.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg.primary,
    padding: SPACING.base,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  body: {
    marginTop: 8,
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
});
