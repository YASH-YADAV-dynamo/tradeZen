import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePortfolio } from '../../src/api/hooks';
import type { Trade } from '../../src/api/types';
import { GlassCard } from '../../src/components/common/GlassCard';
import { useWalletStore } from '../../src/store/walletStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { formatUSD } from '../../src/utils/format';
import { ConnectWalletModal } from '../../src/wallet';

const tradeLabel = (trade: Trade) => {
  const sell = Object.values(trade.sellTokens)[0];
  const buy = Object.values(trade.buyTokens)[0];
  if (!sell || !buy) return 'Swap';
  return `${sell.symbol} to ${buy.symbol}`;
};

export default function PortfolioScreen() {
  const { top } = useSafeAreaInsets();
  const address = useWalletStore((s) => s.address);
  const jwt = useWalletStore((s) => s.jwt);
  const { data, isLoading, isError } = usePortfolio();
  const [showConnect, setShowConnect] = useState(false);

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Portfolio</Text>

      {!address || !jwt ? (
        <GlassCard padding={16} style={styles.card}>
          <Text style={styles.connectHeading}>Connect to view your trades</Text>
          <Text style={styles.muted}>
            Trade history and live mark prices are scoped to your wallet.
          </Text>
          <Pressable style={styles.connectBtn} onPress={() => setShowConnect(true)}>
            <Text style={styles.connectBtnText}>
              {address ? 'Sign in' : 'Connect wallet'}
            </Text>
          </Pressable>
        </GlassCard>
      ) : isLoading ? (
        <ActivityIndicator color={COLORS.green.primary} style={{ marginTop: 24 }} />
      ) : isError ? (
        <GlassCard padding={14} style={styles.card}>
          <Text style={styles.muted}>Could not load portfolio. Is the backend running?</Text>
        </GlassCard>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <GlassCard padding={12} style={styles.summaryCard}>
              <Text style={styles.label}>Trades</Text>
              <Text style={styles.summaryValue}>{data?.summary.tradeCount ?? 0}</Text>
            </GlassCard>
            <GlassCard padding={12} style={styles.summaryCard}>
              <Text style={styles.label}>Volume</Text>
              <Text style={styles.summaryValue}>
                {typeof data?.summary.totalVolumeUsd === 'number'
                  ? formatUSD(data.summary.totalVolumeUsd)
                  : '--'}
              </Text>
            </GlassCard>
          </View>

          <GlassCard padding={12} style={styles.card}>
            <Text style={styles.label}>Successful trades</Text>
            <Text style={styles.summaryValue}>{data?.summary.successfulTrades ?? 0}</Text>
          </GlassCard>

          <Text style={styles.sectionTitle}>Trade History</Text>
          {(data?.trades ?? []).length === 0 ? (
            <GlassCard padding={14} style={styles.card}>
              <Text style={styles.muted}>No trades yet.</Text>
            </GlassCard>
          ) : (
            data?.trades.map((trade) => {
              const sell = Object.values(trade.sellTokens)[0];
              const buy = Object.values(trade.buyTokens)[0];
              return (
                <GlassCard key={trade.txHash} padding={14} style={styles.card}>
                  <View style={styles.row}>
                    <View>
                      <Text style={styles.symbol}>{tradeLabel(trade)}</Text>
                      <Text style={styles.muted}>
                        {trade.status} · {new Date(trade.timestamp).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.right}>
                      <Text style={styles.balance}>{formatUSD(trade.volumeUsd)}</Text>
                      {sell && buy ? (
                        <Text style={styles.usd}>
                          {sell.symbol} to {buy.symbol}
                          {trade.gasless ? ' · gasless' : ''}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </GlassCard>
              );
            })
          )}
        </>
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
    marginBottom: SPACING.base,
  },
  summaryGrid: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1 },
  label: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700' },
  summaryValue: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    marginTop: 6,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: { marginBottom: SPACING.sm },
  muted: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 6 },
  connectHeading: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  connectBtn: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green.primary,
    marginTop: SPACING.sm,
  },
  connectBtnText: { color: COLORS.bg.primary, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.base },
  right: { alignItems: 'flex-end' },
  symbol: {
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.heading,
    fontWeight: '900',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  balance: { color: COLORS.text.primary, fontWeight: '800' },
  usd: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
});
