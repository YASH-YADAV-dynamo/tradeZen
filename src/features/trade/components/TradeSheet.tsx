import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassCard, Button, Metric } from '../../../shared/components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../core/theme';
import { env } from '../../../core/config/env';
import { formatUSD } from '../../../shared/utils';
import { useAuthSession } from '../../auth/hooks';
import { defaultWalletSigner } from '../../auth/utils';
import { Token } from '../../markets/types';
import { useCreateQuote, useOrderStatus, useSubmitOrder } from '../hooks';
import { toBaseUnits, fromBaseUnits } from '../utils';
import { useTradeSheetStore } from '../store/useTradeSheetStore';

interface TradeSheetProps {
  sellCandidates: Token[];
  chain: string;
}

export const TradeSheet: React.FC<TradeSheetProps> = ({ sellCandidates, chain }) => {
  const { isOpen, buyToken, close } = useTradeSheetStore();
  const { session } = useAuthSession();
  const [amount, setAmount] = useState('');
  const [activeQuoteId, setActiveQuoteId] = useState<string>();
  const [submittedOrderId, setSubmittedOrderId] = useState<string>();

  const sellToken = useMemo(
    () => sellCandidates.find((t) => t.address !== buyToken?.address),
    [sellCandidates, buyToken]
  );

  const createQuote = useCreateQuote(session?.token ?? '');
  const submitOrder = useSubmitOrder(session?.token ?? '');
  const orderStatus = useOrderStatus(activeQuoteId, session?.token ?? '');

  const reset = () => {
    setAmount('');
    setActiveQuoteId(undefined);
    setSubmittedOrderId(undefined);
    createQuote.reset();
    submitOrder.reset();
    close();
  };

  const handleGetQuote = () => {
    if (!session || !sellToken || !buyToken || !sellToken.address) return;
    createQuote.mutate({
      chain: chain as never,
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      sellAmount: toBaseUnits(amount, sellToken.decimals),
      takerAddress: session.wallet,
      gasless: env.quoteGaslessDefault,
    });
  };

  const handleSignAndSubmit = async () => {
    const quote = createQuote.data;
    if (!quote?.toSign || !session) return;
    const signature = await defaultWalletSigner.signTypedData(quote.toSign);
    setActiveQuoteId(quote.quoteId);
    const order = await submitOrder.mutateAsync({ quoteId: quote.quoteId, signature });
    setSubmittedOrderId(order.orderId);
  };

  const buyAmount = createQuote.data && buyToken ? createQuote.data.buyTokens[buyToken.address] : undefined;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={reset}>
      <Pressable style={styles.backdrop} onPress={reset} />
      <View style={styles.sheetWrap}>
        <GlassCard padding={18} style={styles.sheet}>
          <Text style={styles.title}>
            {sellToken?.symbol ?? '--'} → {buyToken?.symbol ?? '--'}
          </Text>

          {!session ? (
            <Text style={styles.error}>Connect a wallet in Settings to trade.</Text>
          ) : (
            <>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder={`Amount in ${sellToken?.symbol ?? '...'}`}
                placeholderTextColor={COLORS.text.muted}
                style={styles.input}
                editable={!createQuote.data}
              />

              {!createQuote.data ? (
                <Button
                  label={createQuote.isPending ? 'Getting quote…' : 'Get Quote'}
                  variant="outline"
                  fullWidth
                  disabled={!amount || createQuote.isPending}
                  onPress={handleGetQuote}
                  style={styles.actionButton}
                />
              ) : (
                <>
                  <View style={styles.metrics}>
                    <Metric
                      label={`You receive (${buyToken?.symbol ?? ''})`}
                      value={buyAmount ? fromBaseUnits(buyAmount.amount, buyAmount.decimals) : '--'}
                    />
                    <Metric
                      label="Value"
                      value={buyAmount ? formatUSD(buyAmount.priceUsd * Number(fromBaseUnits(buyAmount.amount, buyAmount.decimals))) : '--'}
                    />
                    <Metric label="Price impact" value={`${(createQuote.data.priceImpact * 100).toFixed(2)}%`} />
                    <Metric label="Fee" value={`${createQuote.data.feeBps / 100}%`} />
                  </View>

                  {!activeQuoteId ? (
                    <Button
                      label={submitOrder.isPending ? 'Submitting…' : 'Sign & Submit'}
                      variant="outline"
                      fullWidth
                      disabled={submitOrder.isPending}
                      onPress={() => void handleSignAndSubmit()}
                      style={styles.actionButton}
                    />
                  ) : (
                    <Text style={styles.status}>
                      Order {(submittedOrderId ?? activeQuoteId).slice(0, 10)}… —{' '}
                      {orderStatus.data?.status ?? 'Pending'}
                    </Text>
                  )}
                </>
              )}

              {createQuote.isError ? (
                <Text style={styles.error}>{createQuote.error.message}</Text>
              ) : null}
              {submitOrder.isError ? <Text style={styles.error}>{submitOrder.error.message}</Text> : null}
            </>
          )}

          <Button label="Close" variant="ghost" fullWidth onPress={reset} style={styles.actionButton} />
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: SPACING.base },
  sheet: { gap: 10 },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    backgroundColor: COLORS.bg.secondary,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { marginTop: 4 },
  status: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm },
  error: { color: COLORS.red.primary, fontSize: TYPOGRAPHY.sizes.sm },
});
