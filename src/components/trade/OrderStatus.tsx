import React, { useEffect, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { useOrderStatus } from '../../api/hooks';
import type { ActiveOrder } from '../../store/orderStore';
import { txExplorerUrl } from '../../constants/explorers';
import { GlassCard } from '../common/GlassCard';
import { useHaptics } from '../../hooks/useHaptics';
import { useOrderStore } from '../../store/orderStore';
import { useTradeStore } from '../../store/tradeStore';
import { useWalletStore } from '../../store/walletStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface OrderStatusProps {
  order: ActiveOrder;
}

/**
 * Live order status. The WS feed pushes updates from `/ws/order/:quoteId`;
 * if it goes silent for 5s we kick off a 2s REST poll on `/api/order/:quoteId/status`
 * as a fallback. Both stop once the order reaches a terminal state.
 */
export const OrderStatus: React.FC<OrderStatusProps> = ({ order }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { onTap, onSuccess } = useHaptics();
  const chain = useWalletStore((s) => s.chain);
  const setQuote = useTradeStore((s) => s.setQuote);
  const clearActive = useOrderStore((s) => s.clearActive);
  const setStatus = useOrderStore((s) => s.setStatus);

  const isFailed = order.status === 'Failed';
  const isDone = order.status === 'Settled' || order.status === 'Confirmed';
  const isTerminal = isFailed || isDone;

  // Start REST polling only after 5s without a WS update, and only while non-terminal.
  const lastWsAt = useOrderStore((s) => s.lastUpdatedAt);
  const wsStale = useMemo(
    () => !isTerminal && (!lastWsAt || Date.now() - lastWsAt > 5000),
    [isTerminal, lastWsAt]
  );

  const statusQuery = useOrderStatus(isTerminal ? null : order.quoteId, wsStale);

  useEffect(() => {
    if (!statusQuery.data) return;
    setStatus(statusQuery.data);
  }, [statusQuery.data, setStatus]);

  useEffect(() => {
    if (isDone) {
      onSuccess();
      void queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }
  }, [isDone, onSuccess, queryClient]);

  const openTx = () => {
    if (!order.txHash) return;
    void Linking.openURL(txExplorerUrl(chain, order.txHash));
  };

  return (
    <View>
      <GlassCard padding={16} style={styles.card}>
        <Text style={[styles.status, isFailed && styles.statusBad]}>{order.status}</Text>
        <Text style={styles.meta}>Order {order.orderId}</Text>
        {order.txHash ? (
          <Pressable onPress={openTx}>
            <Text style={styles.tx}>View transaction</Text>
          </Pressable>
        ) : (
          <Text style={styles.metaDim}>
            {wsStale ? 'Checking settlement status…' : 'Waiting for confirmation…'}
          </Text>
        )}
      </GlassCard>

      {isFailed ? (
        <>
          <Text style={styles.message}>Market moved — let&apos;s try again</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              onTap();
              setQuote(null);
              clearActive();
              router.replace('/(tabs)/trade');
            }}
          >
            <Text style={styles.primaryText}>Get New Quote</Text>
          </Pressable>
        </>
      ) : null}

      {isDone ? (
        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            onTap();
            clearActive();
            router.replace('/(tabs)/trade');
          }}
        >
          <Text style={styles.primaryText}>Trade Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.base },
  status: {
    color: COLORS.green.primary,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  statusBad: { color: COLORS.red.primary },
  meta: { color: COLORS.text.muted, marginTop: 6, fontFamily: TYPOGRAPHY.fonts.mono },
  metaDim: { color: COLORS.text.muted, marginTop: 6, fontSize: TYPOGRAPHY.sizes.xs },
  tx: { color: COLORS.text.primary, marginTop: 10, fontWeight: '700' },
  message: { color: COLORS.text.secondary, marginBottom: SPACING.sm },
  primaryBtn: {
    minHeight: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: COLORS.bg.primary, fontWeight: '900' },
});
