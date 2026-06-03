import axios from 'axios';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useCreateXChangeQuote,
  useMarketPairs,
  useXChangeAsset,
  useXChangeQuoteStatus,
} from '../../src/api/hooks';
import { GlassCard } from '../../src/components/common/GlassCard';
import { useToast } from '../../src/components/common/Toast';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useTradePanelStore, useWalletStore } from '../../src/store';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { MarketPair, XChangeQuote, XChangeSide } from '../../src/types';
import { formatPrice, formatUSD } from '../../src/utils/format';
import { isFormValid, validateTradeForm } from '../../src/utils/validation';

const pickPair = (pairs: MarketPair[] | undefined, selected?: MarketPair) =>
  pairs?.find((pair) => pair.symbol === selected?.symbol) ?? selected ?? pairs?.[0];

const centsToUSD = (value?: number | null) =>
  typeof value === 'number' ? formatUSD(value / 100) : '--';

const shortAddress = (value?: string | null) =>
  value && value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value ?? '--';

const getApiMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as any)?.message;
    return typeof message === 'string' ? message : error.message;
  }
  return 'Unable to create xChange quote';
};

export default function TradeScreen() {
  const { top } = useSafeAreaInsets();
  const toast = useToast();
  const { onSuccess, onError } = useHaptics();
  const { data: pairs } = useMarketPairs();
  const { selectedPair } = useTradePanelStore();
  const apiKey = process.env.EXPO_PUBLIC_XSTOCKS_API_KEY ?? '';
  const { address, chain, setAddress, setChain } = useWalletStore();
  const pair = pickPair(pairs, selectedPair);

  const [side, setSide] = useState<XChangeSide>('Buy');
  const [cashAmount, setCashAmount] = useState('');
  const [quote, setQuote] = useState<XChangeQuote | undefined>();

  const identifier = pair?.base;
  const quoteAmount = Number.parseFloat(cashAmount);
  const availabilityQuery = useXChangeAsset(identifier, apiKey);
  const availability = availabilityQuery.data;
  const quoteMutation = useCreateXChangeQuote(apiKey);
  const quoteStatusQuery = useXChangeQuoteStatus(quote?.id, apiKey);
  const activeQuote = quoteStatusQuery.data ?? quote;

  const enabledNetworks = useMemo(
    () => availability?.networks.filter((network) => network.isEnabled) ?? [],
    [availability]
  );
  const selectedNetwork = enabledNetworks.find((network) => network.network === chain);
  const minOrder = availability?.minOrderFiatValue ?? null;
  const maxOrder = availability?.maxOrderFiatValue;
  const orderCents = Number.isFinite(quoteAmount) ? quoteAmount * 100 : undefined;
  const minOk = minOrder === null || (typeof orderCents === 'number' && orderCents >= minOrder);
  const maxOk =
    typeof maxOrder !== 'number' || (typeof orderCents === 'number' && orderCents <= maxOrder);

  const errors = useMemo(() => {
    if (!pair || typeof pair.price !== 'number') return {};
    return validateTradeForm({
      size: cashAmount,
      leverage: 1,
      direction: side === 'Buy' ? 'long' : 'short',
      entryPrice: pair.price,
      availableBalance: Number.POSITIVE_INFINITY,
    });
  }, [cashAmount, pair, side]);

  const canQuote =
    Boolean(pair && apiKey.trim() && address?.trim() && selectedNetwork) &&
    Boolean(availability?.canQuote) &&
    !availability?.isTradingHalted &&
    minOk &&
    maxOk &&
    isFormValid(errors);

  const requestQuote = async () => {
    if (!pair || !identifier) {
      toast.error('Select an xStock first');
      onError();
      return;
    }
    if (!apiKey.trim()) {
      toast.error('Missing EXPO_PUBLIC_XSTOCKS_API_KEY');
      onError();
      return;
    }
    if (!address?.trim()) {
      toast.error('Add your wallet address');
      onError();
      return;
    }
    if (!selectedNetwork) {
      toast.error(`${chain} is not enabled for ${identifier}`);
      onError();
      return;
    }
    if (!canQuote) {
      toast.error('Order is outside xChange availability or limits');
      onError();
      return;
    }

    try {
      const nextQuote = await quoteMutation.mutateAsync({
        identifier,
        side,
        cashAmount,
        network: chain,
        paymentWalletIdentifier: address.trim(),
        receivingWalletIdentifier: address.trim(),
      });
      setQuote(nextQuote);
      toast.success('Firm xChange quote created');
      onSuccess();
    } catch (error) {
      toast.error(getApiMessage(error));
      onError();
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>xChange Trade</Text>
        <Text style={styles.subtitle}>
          {pair ? `${pair.name} · ${identifier}` : 'Loading xStocks'}
        </Text>
      </View>

      <GlassCard padding={14} style={styles.card}>
        <View style={styles.quoteRow}>
          <View>
            <Text style={styles.label}>Live market quote</Text>
            <Text style={styles.price}>
              {typeof pair?.price === 'number' ? `$${formatPrice(pair.price)}` : '--'}
            </Text>
          </View>
          <View style={styles.networkPill}>
            <Text style={styles.networkText}>
              {availability?.canQuote ? 'RFQ ready' : 'Checking'}
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Execution Setup</Text>
        <Text style={styles.label}>Wallet address or registered wallet ID</Text>
        <TextInput
          value={address ?? ''}
          onChangeText={(value) => setAddress(value.trim() ? value.trim() : null)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="0x... or registered wallet identifier"
          placeholderTextColor={COLORS.text.muted}
          style={styles.input}
        />

        <Text style={styles.label}>Network</Text>
        <View style={styles.segment}>
          {(['Ethereum', 'Mantle', 'Solana'] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setChain(value)}
              style={[styles.segmentButton, chain === value && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, chain === value && styles.segmentTextActive]}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Order Ticket</Text>
        <View style={styles.segment}>
          {(['Buy', 'Sell'] as XChangeSide[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setSide(value)}
              style={[
                styles.segmentButton,
                side === value && (value === 'Buy' ? styles.buyActive : styles.sellActive),
              ]}
            >
              <Text style={[styles.segmentText, side === value && styles.segmentTextActive]}>
                {value.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Cash amount</Text>
        <TextInput
          value={cashAmount}
          onChangeText={setCashAmount}
          keyboardType="decimal-pad"
          placeholder="USDC amount"
          placeholderTextColor={COLORS.text.muted}
          style={styles.input}
        />
        {errors.size ? <Text style={styles.error}>{errors.size}</Text> : null}
        {!minOk ? <Text style={styles.error}>Below xChange minimum order</Text> : null}
        {!maxOk ? <Text style={styles.error}>Above xChange maximum order</Text> : null}

        <View style={styles.metrics}>
          <Metric label="Min" value={centsToUSD(minOrder)} />
          <Metric label="Max" value={centsToUSD(maxOrder)} />
          <Metric label="Bid" value={centsToUSD(availability?.bid)} />
          <Metric label="Ask" value={centsToUSD(availability?.ask)} />
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>xChange Availability</Text>
        <Detail label="Trading" value={availability?.canQuote ? 'Can quote' : 'Unavailable'} />
        <Detail label="Halt" value={availability?.isTradingHalted ? 'Halted' : 'Not halted'} />
        <Detail label="Period" value={availability?.limitsPerPeriod?.currentPeriod ?? '--'} />
        <Detail
          label="Selected network"
          value={selectedNetwork ? `${chain} enabled` : `${chain} not enabled`}
        />
        {availabilityQuery.isError ? (
          <Text style={styles.error}>xChange limits are unavailable right now.</Text>
        ) : null}
      </GlassCard>

      <Pressable
        disabled={!canQuote || quoteMutation.isPending}
        style={[styles.submit, (!canQuote || quoteMutation.isPending) && styles.submitDisabled]}
        onPress={requestQuote}
      >
        <Text style={styles.submitText}>
          {quoteMutation.isPending ? 'Creating Quote...' : 'Create Firm xChange Quote'}
        </Text>
      </Pressable>

      {activeQuote ? (
        <GlassCard padding={14} style={styles.resultCard} glow="green">
        <Text style={styles.cardTitle}>Execution Payload</Text>
          <Detail label="Quote ID" value={activeQuote.id} mono />
          <Detail label="Price" value={typeof activeQuote.price === 'number' ? `$${formatPrice(activeQuote.price)}` : '--'} />
          <Detail label="Quantity" value={String(activeQuote.quantity ?? '--')} />
          <Detail label="Quote status" value={activeQuote.generalStatus ?? '--'} />
          <Detail label="Blockchain" value={activeQuote.blockchainStatus ?? '--'} />
          <Detail label="Wallet" value={shortAddress(address)} mono />
          <Detail
            label="Contract"
            value={activeQuote.contract?.address ?? selectedNetwork?.contractAddress ?? 'SVM transaction payload'}
            mono
          />
          <Detail
            label="Token"
            value={activeQuote.tokenDeployment?.address ?? selectedNetwork?.tokenAddress ?? '--'}
            mono
          />
          <Detail label="Signature" value={activeQuote.signature ? 'Ready' : 'Pending'} />
          <Text style={styles.caption}>
            The quote is real. Submit the returned signature payload with a wallet signer
            to complete atomic settlement.
          </Text>
          <Pressable disabled style={[styles.submit, styles.submitDisabled, styles.execute]}>
            <Text style={styles.submitText}>Wallet signer required to execute</Text>
          </Pressable>
        </GlassCard>
      ) : null}
    </ScrollView>
  );
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const Detail = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, mono && styles.mono]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { padding: SPACING.base, paddingBottom: 196 },
  header: { marginBottom: SPACING.base },
  title: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.heading,
  },
  subtitle: { color: COLORS.text.muted, marginTop: 4 },
  card: { marginBottom: SPACING.base },
  resultCard: { marginTop: SPACING.base, marginBottom: SPACING.base },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.base,
  },
  label: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  price: {
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '800',
  },
  networkPill: {
    borderWidth: 1,
    borderColor: COLORS.green.dim,
    backgroundColor: COLORS.green.subtle,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  networkText: { color: COLORS.green.primary, fontWeight: '800', fontSize: 11 },
  cardTitle: { color: COLORS.text.primary, fontWeight: '800', fontSize: TYPOGRAPHY.sizes.lg },
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: COLORS.green.subtle, borderColor: COLORS.green.primary },
  buyActive: { backgroundColor: COLORS.green.dim, borderColor: COLORS.green.primary },
  sellActive: { backgroundColor: COLORS.red.dim, borderColor: COLORS.red.primary },
  segmentText: { color: COLORS.text.muted, fontWeight: '800', fontSize: TYPOGRAPHY.sizes.xs },
  segmentTextActive: { color: COLORS.text.primary },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    backgroundColor: COLORS.bg.secondary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  error: { color: COLORS.red.primary, marginTop: 6, fontSize: TYPOGRAPHY.sizes.xs },
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border.muted,
    gap: SPACING.base,
    paddingVertical: 10,
  },
  detailLabel: { color: COLORS.text.muted, fontWeight: '700', fontSize: TYPOGRAPHY.sizes.sm },
  detailValue: {
    flex: 1,
    color: COLORS.text.primary,
    fontWeight: '800',
    textAlign: 'right',
  },
  mono: { fontFamily: TYPOGRAPHY.fonts.mono, fontSize: TYPOGRAPHY.sizes.xs },
  caption: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 18,
    marginTop: 12,
  },
  submit: {
    minHeight: 52,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: { opacity: 0.45 },
  execute: { marginTop: 14 },
  submitText: { color: COLORS.bg.primary, fontWeight: '900', fontSize: TYPOGRAPHY.sizes.sm },
});
