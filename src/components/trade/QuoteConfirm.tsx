import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useOrder } from '../../api/hooks';
import type { QuoteResponse } from '../../api/types';
import { useToast } from '../common/Toast';
import { DetailRow } from '../common/DetailRow';
import { GlassCard } from '../common/GlassCard';
import { useHaptics } from '../../hooks/useHaptics';
import { useOrderStore } from '../../store/orderStore';
import { useWalletStore } from '../../store/walletStore';
import { buildTypedData } from '../../trade/signQuote';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { fromBaseUnits } from '../../utils/amount';
import { getBuyToken, getSellToken } from '../../utils/quote';
import { useWallet } from '../../wallet';
import { connectOrderSocket } from '../../ws/orderSocket';

interface QuoteConfirmProps {
  quote: QuoteResponse;
}

/**
 * Displays quote summary then either:
 *   - Gasless: signs EIP-712 → POST /api/order → opens order WS
 *   - Self-execution: broadcasts quote.tx from the wallet (user pays gas)
 */
export const QuoteConfirm: React.FC<QuoteConfirmProps> = ({ quote }) => {
  const router = useRouter();
  const toast = useToast();
  const { onTap, onSuccess, onError } = useHaptics();
  const wallet = useWallet();
  const address = useWalletStore((s) => s.address);
  const orderMutation = useOrder();
  const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const sellToken = getSellToken(quote);
  const buyToken = getBuyToken(quote);

  useEffect(() => {
    const tick = () => setSecondsLeft(Math.max(0, Math.floor(quote.expiresAt - Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quote.expiresAt]);

  if (!sellToken || !buyToken) {
    return (
      <GlassCard padding={14}>
        <Text style={styles.errorText}>Quote is missing token details.</Text>
      </GlassCard>
    );
  }

  const isGasless = quote.gasless;
  const expired = secondsLeft === 0;
  const sellHuman = fromBaseUnits(sellToken.amount, sellToken.decimals);
  const buyHuman = fromBaseUnits(buyToken.amount, buyToken.decimals);
  const buyBeforeFee = buyToken.amountBeforeFee
    ? fromBaseUnits(buyToken.amountBeforeFee, buyToken.decimals)
    : buyHuman;
  const showFeeStrikethrough = buyBeforeFee !== buyHuman;

  const handleConfirm = async () => {
    if (!address || expired) return;
    onTap();
    setSubmitting(true);
    try {
      if (isGasless) {
        if (!quote.toSign) throw new Error('Gasless quote missing toSign');
        const signature = await wallet.signTypedData(buildTypedData(quote));
        const order = await orderMutation.mutateAsync({ quoteId: quote.quoteId, signature });
        connectOrderSocket(quote.quoteId);
        onSuccess();
        router.replace('/order-status');
        if (!order.orderId) toast.success('Order submitted');
      } else {
        if (!quote.tx) throw new Error('Self-execution quote missing tx payload');
        const txHash = await wallet.sendTransaction(quote.tx);
        setActiveOrder({
          orderId: quote.quoteId,
          quoteId: quote.quoteId,
          status: 'Pending',
          txHash,
        });
        onSuccess();
        router.replace('/order-status');
      }
    } catch (err) {
      onError();
      toast.error(err instanceof Error ? err.message : 'Signing failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cta = isGasless ? 'Sign & Submit' : 'Send Transaction';
  const ctaSub = isGasless
    ? 'You sign typed data; Bebop submits the trade and covers gas.'
    : 'Your wallet broadcasts the swap transaction. You pay gas.';

  return (
    <View>
      <GlassCard padding={14} style={styles.card}>
        <DetailRow label="Sell" value={`${sellHuman} ${sellToken.symbol}`} />
        <DetailRow
          label="Receive"
          value={`${buyHuman} ${buyToken.symbol}`}
          sub={showFeeStrikethrough ? `${buyBeforeFee} before fee` : undefined}
        />
        <DetailRow label="Platform fee" value={`${quote.feeBps} bps (${quote.feeTier})`} />
        <DetailRow label="Price impact" value={`${quote.priceImpact.toFixed(2)}%`} />
        <DetailRow label="Mode" value={isGasless ? 'Gasless (Bebop submits)' : 'Self-execution'} />
        {!isGasless && quote.tx ? (
          <DetailRow label="Est. gas" value={`${quote.tx.gas.toLocaleString()} units`} />
        ) : null}
        <DetailRow
          label="Expires in"
          value={
            expired ? 'EXPIRED — get a new quote' : `${secondsLeft}s`
          }
        />
      </GlassCard>

      <Text style={styles.note}>{ctaSub}</Text>

      <Pressable
        style={[styles.primaryBtn, (submitting || expired) && styles.disabled]}
        onPress={handleConfirm}
        disabled={submitting || expired}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.bg.primary} />
        ) : (
          <Text style={styles.primaryText}>{expired ? 'Quote expired' : cta}</Text>
        )}
      </Pressable>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Back to trade panel</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.base },
  errorText: { color: COLORS.text.muted },
  note: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.6 },
  primaryText: { color: COLORS.bg.primary, fontWeight: '900' },
  backBtn: { marginTop: 12, alignItems: 'center', padding: 12 },
  backText: { color: COLORS.text.muted, fontWeight: '700' },
});
