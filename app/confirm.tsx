import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../src/components/mascot/Mascot';
import { QuoteConfirm } from '../src/components/trade/QuoteConfirm';
import { useTradeStore } from '../src/store/tradeStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/theme';

export default function ConfirmScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const quote = useTradeStore((s) => s.quote);

  useEffect(() => {
    if (!quote) router.replace('/(tabs)/trade');
  }, [quote, router]);

  if (!quote) return null;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Confirm Trade</Text>
      <Mascot />
      <QuoteConfirm quote={quote} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { padding: SPACING.base, paddingBottom: 40 },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
    marginBottom: SPACING.sm,
  },
});
