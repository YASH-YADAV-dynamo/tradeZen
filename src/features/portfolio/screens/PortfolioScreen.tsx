import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer, GlassCard } from '../../../shared/components';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../core/theme';
import { formatUSD } from '../../../shared/utils';
import { useAuthSession } from '../../auth/hooks';
import { useWalletStore } from '../../wallet/store/useWalletStore';
import { usePortfolio } from '../hooks';
import { TradeRow, SummaryCard } from '../components';

export const PortfolioScreen: React.FC = () => {
  const { session, isAuthenticated } = useAuthSession();
  const chain = useWalletStore((state) => state.chain);
  const portfolio = usePortfolio(chain, session?.token);

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Portfolio</Text>

      {!isAuthenticated ? (
        <GlassCard padding={14} style={styles.emptyCard}>
          <Text style={styles.muted}>Connect a wallet in Settings to see your trade history.</Text>
        </GlassCard>
      ) : portfolio.isLoading ? (
        <GlassCard padding={14} style={styles.emptyCard}>
          <Text style={styles.muted}>Loading portfolio…</Text>
        </GlassCard>
      ) : portfolio.isError ? (
        <GlassCard padding={14} style={styles.emptyCard}>
          <Text style={styles.error}>{portfolio.error.message}</Text>
        </GlassCard>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <SummaryCard label="Total Volume" value={formatUSD(portfolio.data?.summary.totalVolumeUsd ?? 0)} />
            <SummaryCard
              label="Success Rate"
              value={
                portfolio.data && portfolio.data.summary.tradeCount > 0
                  ? `${((portfolio.data.summary.successfulTrades / portfolio.data.summary.tradeCount) * 100).toFixed(0)}%`
                  : '--'
              }
              tone="green"
            />
          </View>

          <Text style={styles.sectionTitle}>
            Trades {portfolio.data ? `(${portfolio.data.summary.tradeCount})` : ''}
          </Text>
          {!portfolio.data || portfolio.data.trades.length === 0 ? (
            <GlassCard padding={14} style={styles.emptyCard}>
              <Text style={styles.muted}>No trades yet.</Text>
            </GlassCard>
          ) : (
            portfolio.data.trades.map((trade) => <TradeRow key={trade.txHash} trade={trade} />)
          )}
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
    marginBottom: SPACING.base,
  },
  summaryGrid: { flexDirection: 'row', gap: 10 },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyCard: { marginBottom: SPACING.sm },
  muted: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.sm },
  error: { color: COLORS.red.primary, fontSize: TYPOGRAPHY.sizes.sm },
});
