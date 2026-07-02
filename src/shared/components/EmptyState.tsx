import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPOGRAPHY } from '../../core/theme';

interface EmptyStateProps {
  title: string;
  body?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, body }) => (
  <View style={styles.empty}>
    <Text style={styles.title}>{title}</Text>
    {body ? <Text style={styles.body}>{body}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
    marginTop: 10,
  },
  body: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 4,
  },
});
