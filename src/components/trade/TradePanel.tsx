import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useQuote, useTokens } from '../../api/hooks';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import { useToast } from '../common/Toast';
import { GlassCard } from '../common/GlassCard';
import { useHaptics } from '../../hooks/useHaptics';
import { useTradeStore } from '../../store/tradeStore';
import { useWalletStore } from '../../store/walletStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { fromBaseUnits, toBaseUnits } from '../../utils/amount';
import { getBuyToken } from '../../utils/quote';
import { useWallet } from '../../wallet';
import { QuoteTimer } from './QuoteTimer';
import { TokenPicker } from './TokenPicker';

type ExecutionMode = 'gasless' | 'self';

/**
 * RFQ trade form — token + amount + execution mode → quote.
 * Authentication is assumed (Trade screen gates this).
 */
export const TradePanel: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { onTap, onSelect } = useHaptics();
  const wallet = useWallet();

  const address = useWalletStore((s) => s.address);
  const jwt = useWalletStore((s) => s.jwt);
  const chain = useWalletStore((s) => s.chain);
  const setChain = useWalletStore((s) => s.setChain);
  const sellToken = useTradeStore((s) => s.sellToken);
  const buyToken = useTradeStore((s) => s.buyToken);
  const sellAmount = useTradeStore((s) => s.sellAmount);
  const quote = useTradeStore((s) => s.quote);
  const isQuoteLoading = useTradeStore((s) => s.isQuoteLoading);
  const quoteError = useTradeStore((s) => s.quoteError);
  const setSellToken = useTradeStore((s) => s.setSellToken);
  const setBuyToken = useTradeStore((s) => s.setBuyToken);
  const setSellAmount = useTradeStore((s) => s.setSellAmount);
  const setQuote = useTradeStore((s) => s.setQuote);
  const swapTokens = useTradeStore((s) => s.swapTokens);

  const { data: tokens = [], isLoading: tokensLoading } = useTokens();
  const quoteMutation = useQuote();
  const [picker, setPicker] = useState<'sell' | 'buy' | null>(null);
  const [mode, setMode] = useState<ExecutionMode>('gasless');

  const sellable = useMemo(() => tokens.filter((t) => t.canSell), [tokens]);
  const buyable = useMemo(() => tokens.filter((t) => t.canBuy), [tokens]);

  const validAmount = useMemo(() => {
    if (!sellAmount) return false;
    const n = Number(sellAmount);
    return Number.isFinite(n) && n > 0;
  }, [sellAmount]);

  const requestQuote = useCallback(() => {
    if (!address) {
      toast.warning('Connect wallet first');
      return;
    }
    if (!jwt) {
      toast.warning('Sign in to request quotes');
      void wallet.authenticate().catch(() => undefined);
      return;
    }
    if (!sellToken || !buyToken) {
      toast.warning('Select both tokens');
      return;
    }
    if (!validAmount) {
      toast.warning('Enter an amount greater than 0');
      return;
    }
    onTap();
    quoteMutation.mutate({
      chain,
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      sellAmount: toBaseUnits(sellAmount, sellToken.decimals),
      takerAddress: address,
      gasless: mode === 'gasless',
    });
  }, [
    address,
    jwt,
    wallet,
    sellToken,
    buyToken,
    validAmount,
    sellAmount,
    chain,
    mode,
    onTap,
    quoteMutation,
    toast,
  ]);

  useEffect(() => {
    if (quoteError) toast.error(quoteError);
  }, [quoteError, toast]);

  // Clear the active quote when any input that affects pricing changes.
  useEffect(() => {
    setQuote(null);
  }, [chain, mode, sellToken?.address, buyToken?.address, sellAmount, setQuote]);

  const buyTokenEntry = quote ? getBuyToken(quote) : null;
  const buyDisplay = buyTokenEntry
    ? fromBaseUnits(buyTokenEntry.amount, buyTokenEntry.decimals)
    : null;

  return (
    <View>
      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.label}>Network</Text>
        <View style={styles.chainRow}>
          {SUPPORTED_CHAINS.map((value) => (
            <Pressable
              key={value}
              onPress={() => {
                onSelect();
                setChain(value);
              }}
              style={[styles.chainBtn, chain === value && styles.chainActive]}
            >
              <Text style={[styles.chainText, chain === value && styles.chainTextActive]}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.label}>Execution</Text>
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeBtn, mode === 'gasless' && styles.modeActive]}
            onPress={() => {
              onSelect();
              setMode('gasless');
            }}
          >
            <Text style={[styles.modeTitle, mode === 'gasless' && styles.modeTitleActive]}>
              Gasless
            </Text>
            <Text style={styles.modeSub}>Sign typed data · Bebop pays gas</Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, mode === 'self' && styles.modeActive]}
            onPress={() => {
              onSelect();
              setMode('self');
            }}
          >
            <Text style={[styles.modeTitle, mode === 'self' && styles.modeTitleActive]}>
              Self-execute
            </Text>
            <Text style={styles.modeSub}>Send tx from wallet · you pay gas</Text>
          </Pressable>
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.label}>You pay</Text>
        <Pressable style={styles.tokenBtn} onPress={() => setPicker('sell')}>
          <Text style={styles.tokenBtnText}>
            {sellToken ? sellToken.symbol : 'Select token'}
          </Text>
        </Pressable>
        <TextInput
          value={sellAmount}
          onChangeText={setSellAmount}
          placeholder="0.0"
          placeholderTextColor={COLORS.text.muted}
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </GlassCard>

      <Pressable style={styles.swapBtn} onPress={() => { onSelect(); swapTokens(); }}>
        <Ionicons name="swap-vertical" size={18} color={COLORS.green.primary} />
        <Text style={styles.swapText}>Swap direction</Text>
      </Pressable>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.label}>You receive</Text>
        <Pressable style={styles.tokenBtn} onPress={() => setPicker('buy')}>
          <Text style={styles.tokenBtnText}>
            {buyToken ? buyToken.symbol : 'Select token'}
          </Text>
        </Pressable>
        {buyDisplay ? (
          <Text style={styles.receiveAmount}>
            {buyDisplay} {buyTokenEntry?.symbol}
          </Text>
        ) : null}
      </GlassCard>

      {quote ? (
        <GlassCard padding={14} style={styles.card}>
          <Text style={styles.label}>Quote ({quote.gasless ? 'gasless' : 'self-execution'})</Text>
          <Text style={styles.quoteLine}>
            Fee: {quote.feeBps} bps ({quote.feeTier})
          </Text>
          <Text style={styles.quoteLine}>Price impact: {quote.priceImpact.toFixed(2)}%</Text>
          <QuoteTimer expiresAt={quote.expiresAt} onExpired={requestQuote} />
        </GlassCard>
      ) : null}

      <Pressable
        style={[styles.primaryBtn, isQuoteLoading && styles.primaryDisabled]}
        onPress={requestQuote}
        disabled={isQuoteLoading || tokensLoading}
      >
        {isQuoteLoading ? (
          <ActivityIndicator color={COLORS.bg.primary} />
        ) : (
          <Text style={styles.primaryText}>{quote ? 'Refresh Quote' : 'Get Quote'}</Text>
        )}
      </Pressable>

      {quote ? (
        <Pressable
          style={styles.confirmBtn}
          onPress={() => {
            onTap();
            router.push('/confirm');
          }}
        >
          <Text style={styles.confirmText}>Review & Confirm</Text>
        </Pressable>
      ) : null}

      <TokenPicker
        visible={picker === 'sell'}
        tokens={sellable}
        title="Select sell token"
        onClose={() => setPicker(null)}
        onSelect={setSellToken}
      />
      <TokenPicker
        visible={picker === 'buy'}
        tokens={buyable}
        title="Select buy token"
        onClose={() => setPicker(null)}
        onSelect={setBuyToken}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.sm },
  label: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
    marginBottom: 8,
  },
  chainRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chainBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  chainActive: {
    backgroundColor: COLORS.green.subtle,
    borderColor: COLORS.green.primary,
  },
  chainText: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  chainTextActive: { color: COLORS.green.primary },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  modeActive: {
    borderColor: COLORS.green.primary,
    backgroundColor: COLORS.green.subtle,
  },
  modeTitle: { color: COLORS.text.primary, fontWeight: '900' },
  modeTitleActive: { color: COLORS.green.primary },
  modeSub: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, marginTop: 4 },
  tokenBtn: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: COLORS.bg.secondary,
  },
  tokenBtnText: { color: COLORS.text.primary, fontWeight: '800' },
  input: {
    minHeight: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
    backgroundColor: COLORS.bg.secondary,
  },
  swapBtn: {
    alignSelf: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    backgroundColor: COLORS.green.subtle,
  },
  swapText: {
    color: COLORS.green.primary,
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.3,
  },
  receiveAmount: {
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontWeight: '700',
    marginTop: 4,
  },
  quoteLine: { color: COLORS.text.secondary, marginTop: 4 },
  primaryBtn: {
    minHeight: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  primaryDisabled: { opacity: 0.6 },
  primaryText: { color: COLORS.bg.primary, fontWeight: '900' },
  confirmBtn: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmText: { color: COLORS.text.primary, fontWeight: '800' },
});
