import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMarketPairs } from '../../src/api/hooks';
import { GlassCard } from '../../src/components/common/GlassCard';
import { usePositionsStore } from '../../src/store';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { formatPrice, formatUSD } from '../../src/utils/format';
import { calcMargin, calcPnL, calcPnLPct } from '../../src/utils/math';

export default function PortfolioScreen() {
  const { top } = useSafeAreaInsets();
  const { data: pairs } = useMarketPairs();
  const { positions, closePosition } = usePositionsStore();

  const priceBySymbol = useMemo(
    () => new Map((pairs ?? []).map((pair) => [pair.symbol, pair.price])),
    [pairs]
  );

  const active = positions.filter((position) => !position.closedAt);
  const closed = positions.filter((position) => position.closedAt);
  const totalPnl = active.reduce((sum, position) => {
    const mark = priceBySymbol.get(position.symbol);
    if (typeof mark !== 'number') return sum;
    return sum + calcPnL(position.entryPrice, mark, position.size, position.direction);
  }, 0);
  const marginUsed = active.reduce(
    (sum, position) => sum + calcMargin(position.size, position.leverage),
    0
  );

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Portfolio</Text>

      <View style={styles.summaryGrid}>
        <GlassCard padding={12} style={styles.summaryCard}>
          <Text style={styles.label}>Unrealized PnL</Text>
          <Text style={[styles.summaryValue, totalPnl >= 0 ? styles.green : styles.red]}>
            {formatUSD(totalPnl)}
          </Text>
        </GlassCard>
        <GlassCard padding={12} style={styles.summaryCard}>
          <Text style={styles.label}>Margin Used</Text>
          <Text style={styles.summaryValue}>{formatUSD(marginUsed)}</Text>
        </GlassCard>
      </View>

      <Text style={styles.sectionTitle}>Open Positions</Text>
      {active.length === 0 ? (
        <GlassCard padding={14} style={styles.card}>
          <Text style={styles.muted}>No open positions.</Text>
        </GlassCard>
      ) : (
        active.map((position) => {
          const mark = priceBySymbol.get(position.symbol);
          const pnl =
            typeof mark === 'number'
              ? calcPnL(position.entryPrice, mark, position.size, position.direction)
              : undefined;
          const roe =
            typeof pnl === 'number'
              ? calcPnLPct(pnl, calcMargin(position.size, position.leverage))
              : undefined;

          return (
            <GlassCard key={position.id} padding={14} style={styles.card}>
              <View style={styles.positionHeader}>
                <View>
                  <Text style={styles.symbol}>{position.symbol}</Text>
                  <Text style={styles.muted}>{position.name}</Text>
                </View>
                <Text style={[styles.side, position.direction === 'long' ? styles.green : styles.red]}>
                  {position.direction.toUpperCase()} {position.leverage}x
                </Text>
              </View>

              <View style={styles.metrics}>
                <Metric label="Entry" value={`$${formatPrice(position.entryPrice)}`} />
                <Metric
                  label="Mark"
                  value={typeof mark === 'number' ? `$${formatPrice(mark)}` : '--'}
                />
                <Metric
                  label="PnL"
                  value={typeof pnl === 'number' ? formatUSD(pnl) : '--'}
                  tone={typeof pnl === 'number' && pnl < 0 ? 'red' : 'green'}
                />
                <Metric
                  label="ROE"
                  value={typeof roe === 'number' ? `${roe.toFixed(2)}%` : '--'}
                  tone={typeof roe === 'number' && roe < 0 ? 'red' : 'green'}
                />
              </View>

              <Pressable
                disabled={typeof mark !== 'number'}
                onPress={() => typeof mark === 'number' && closePosition(position.id, mark)}
                style={[styles.closeButton, typeof mark !== 'number' && styles.closeDisabled]}
              >
                <Text style={styles.closeText}>Close at Market</Text>
              </Pressable>
            </GlassCard>
          );
        })
      )}

      <Text style={styles.sectionTitle}>History</Text>
      {closed.length === 0 ? (
        <GlassCard padding={14} style={styles.card}>
          <Text style={styles.muted}>No closed trades.</Text>
        </GlassCard>
      ) : (
        closed.map((position) => (
          <GlassCard key={position.id} padding={14} style={styles.card}>
            <View style={styles.positionHeader}>
              <Text style={styles.symbol}>{position.symbol}</Text>
              <Text style={styles.muted}>
                Exit{' '}
                {typeof position.exitPrice === 'number'
                  ? `$${formatPrice(position.exitPrice)}`
                  : '--'}
              </Text>
            </View>
          </GlassCard>
        ))
      )}
    </ScrollView>
  );
}

const Metric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'green' | 'red';
}) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text
      style={[
        styles.metricValue,
        tone === 'green' && styles.green,
        tone === 'red' && styles.red,
      ]}
    >
      {value}
    </Text>
  </View>
);

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
  muted: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.sm },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.base,
    alignItems: 'flex-start',
  },
  symbol: {
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.heading,
    fontWeight: '900',
    fontSize: TYPOGRAPHY.sizes.md,
  },
  side: { fontWeight: '900', fontSize: TYPOGRAPHY.sizes.xs },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metric: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    padding: 10,
    backgroundColor: COLORS.bg.secondary,
  },
  metricLabel: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs },
  metricValue: { color: COLORS.text.primary, fontWeight: '800', marginTop: 4 },
  green: { color: COLORS.green.primary },
  red: { color: COLORS.red.primary },
  closeButton: {
    minHeight: 42,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    marginTop: 14,
  },
  closeDisabled: { opacity: 0.45 },
  closeText: { color: COLORS.text.primary, fontWeight: '800' },
});
