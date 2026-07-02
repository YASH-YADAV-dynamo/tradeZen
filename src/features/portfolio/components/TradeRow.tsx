import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '../../../shared/components';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../core/theme';
import { formatUSD } from '../../../shared/utils';
import { Trade } from '../types';

const STATUS_TONE: Record<string, 'green' | 'red' | 'neutral'> = {
  Success: 'green',
  Settled: 'green',
  Confirmed: 'green',
  Failed: 'red',
  Pending: 'neutral',
};

export const TradeRow: React.FC<{ trade: Trade }> = ({ trade }) => {
  const tone = STATUS_TONE[trade.status] ?? 'neutral';

  return (
    <GlassCard padding={14} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.hash} numberOfLines={1}>
            {trade.txHash}
          </Text>
          <Text
            style={[
              styles.status,
              tone === 'green' && styles.green,
              tone === 'red' && styles.red,
            ]}
          >
            {trade.status}
          </Text>
        </View>
        <Text style={styles.volume}>{formatUSD(trade.volumeUsd)}</Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  left: { flex: 1, minWidth: 0 },
  hash: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fonts.mono, fontSize: TYPOGRAPHY.sizes.sm },
  status: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700', marginTop: 4 },
  green: { color: COLORS.green.primary },
  red: { color: COLORS.red.primary },
  volume: { color: COLORS.text.primary, fontWeight: '800' },
});
