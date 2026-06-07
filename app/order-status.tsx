import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Mascot } from '../src/components/mascot/Mascot';
import { OrderStatus } from '../src/components/trade/OrderStatus';
import { useOrderStore } from '../src/store/orderStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/theme';
import { connectOrderSocket, disconnectOrderSocket } from '../src/ws/orderSocket';

export default function OrderStatusScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const activeOrder = useOrderStore((s) => s.activeOrder);

  // Drive the WS subscription here so re-renders inside OrderStatus don't reconnect.
  useEffect(() => {
    if (!activeOrder?.quoteId) return;
    // Only gasless orders have a quoteId WS path; self-exec relies on REST polling.
    connectOrderSocket(activeOrder.quoteId);
    return () => disconnectOrderSocket();
  }, [activeOrder?.quoteId]);

  useEffect(() => {
    if (!activeOrder) router.replace('/(tabs)/trade');
  }, [activeOrder, router]);

  if (!activeOrder) return null;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Order Status</Text>
      <Mascot />
      <OrderStatus order={activeOrder} />
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
