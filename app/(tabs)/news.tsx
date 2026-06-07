import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NewsFeed } from '../../src/components/news/NewsFeed';
import { useTradeableFilteredNews } from '../../src/store/newsStore';
import { COLORS, FONTS, SPACING, TYPOGRAPHY } from '../../src/theme';

export default function NewsScreen() {
  const { top } = useSafeAreaInsets();
  const total = useTradeableFilteredNews().length;

  return (
    <View style={[styles.root, { paddingTop: Math.max(top, SPACING.sm) }]}>
      <NewsFeed
        ListHeader={
          <View style={styles.header}>
            <Text style={styles.title}>News</Text>
            <Text style={styles.subtitle}>
              {total > 0
                ? `${total} headlines for your tradeable pairs · live`
                : 'Headlines for tokens you can trade'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  title: {
    color: COLORS.text.primary,
    fontFamily: FONTS.heading,
    fontWeight: '900',
    fontSize: TYPOGRAPHY.sizes['2xl'],
  },
  subtitle: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});
