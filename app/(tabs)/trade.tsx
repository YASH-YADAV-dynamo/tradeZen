import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../../src/components/mascot/Mascot';
import { GlassCard } from '../../src/components/common/GlassCard';
import { TradePanel } from '../../src/components/trade/TradePanel';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { ConnectWalletModal, useWallet } from '../../src/wallet';

export default function TradeScreen() {
  const { top } = useSafeAreaInsets();
  const wallet = useWallet();
  const [showConnect, setShowConnect] = useState(false);

  const ready = !!wallet.address;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Trade</Text>
      <Mascot />

      {!ready ? (
        <GlassCard padding={20} style={styles.connectCard}>
          <Text style={styles.connectHeading}>Connect a wallet to trade</Text>
          <Text style={styles.connectBody}>
            You can browse markets and prices without a wallet. Connect to request RFQ quotes and
            settle trades gaslessly via Bebop.
          </Text>
          <Pressable style={styles.connectBtn} onPress={() => setShowConnect(true)}>
            <Text style={styles.connectBtnText}>Connect wallet</Text>
          </Pressable>
        </GlassCard>
      ) : (
        <TradePanel />
      )}

      <ConnectWalletModal visible={showConnect} onClose={() => setShowConnect(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { padding: SPACING.base, paddingBottom: 196 },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
    marginBottom: SPACING.sm,
  },
  connectCard: { gap: SPACING.sm, marginTop: SPACING.sm },
  connectHeading: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  connectBody: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  connectBtn: {
    minHeight: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green.primary,
    marginTop: SPACING.xs,
  },
  connectBtnText: { color: COLORS.bg.primary, fontWeight: '900' },
});
