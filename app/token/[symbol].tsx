import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRestPrices, useTokens } from '../../src/api/hooks';
import { GlassCard } from '../../src/components/common/GlassCard';
import { NewsCard } from '../../src/components/news/NewsCard';
import { PriceChart } from '../../src/components/trade/PriceChart';
import { useHaptics } from '../../src/hooks/useHaptics';
import { useNewsForToken } from '../../src/store/newsStore';
import { useTokenPrice } from '../../src/store/priceStore';
import { useTradeStore } from '../../src/store/tradeStore';
import { useWalletChain } from '../../src/store/walletStore';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { ConnectWalletModal, useWallet } from '../../src/wallet';
import { subscribePriceFeed } from '../../src/ws/priceSocket';

/**
 * Token detail screen — viewable without a wallet.
 * Wallet is requested only when the user taps "Trade".
 */
export default function TokenDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const { top } = useSafeAreaInsets();
  const { onTap } = useHaptics();
  const chain = useWalletChain();
  const wallet = useWallet();
  const setBuyToken = useTradeStore((s) => s.setBuyToken);
  const setSellToken = useTradeStore((s) => s.setSellToken);

  const symbolStr = typeof symbol === 'string' ? symbol : '';
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    if (!chain) return;
    return subscribePriceFeed(chain);
  }, [chain]);

  const { data: tokens, isLoading } = useTokens();
  useRestPrices();

  const token = useMemo(
    () => tokens?.find((t) => t.symbol.toLowerCase() === symbolStr.toLowerCase()),
    [tokens, symbolStr]
  );

  const usdcToken = useMemo(
    () => tokens?.find((t) => t.symbol.toUpperCase() === 'USDC' && t.canSell),
    [tokens]
  );

  const price = useTokenPrice(token?.address);

  // News for this token comes from the global store (hydrated once by NewsBoot).
  // No per-screen REST/SSE — newsForToken matches on symbol, address, and the
  // xStock alias (AAPLx → AAPL) so we cover both crypto and xStock feeds.
  const displayNews = useNewsForToken({
    symbol: symbolStr,
    address: token?.address,
  });

  const goToTrade = useCallback(() => {
    if (!token) return;
    if (token.canBuy && usdcToken) {
      setSellToken(usdcToken);
      setBuyToken(token);
    } else if (token.canSell) {
      setSellToken(token);
      if (usdcToken) setBuyToken(usdcToken);
    }
    router.push('/(tabs)/trade');
  }, [token, usdcToken, setSellToken, setBuyToken, router]);

  const handleTrade = useCallback(() => {
    if (!token) return;
    onTap();
    if (!wallet.address) {
      setShowConnect(true);
      return;
    }
    goToTrade();
  }, [token, onTap, wallet.address, goToTrade]);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <ActivityIndicator color={COLORS.green.primary} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <Text style={styles.muted}>Token not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isHalted = !token.canBuy && !token.canSell;
  const tradeLabel = isHalted
    ? 'Trading paused'
    : !wallet.address
      ? `Connect wallet to trade ${token.symbol}`
      : `Trade ${token.symbol}`;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={18} color={COLORS.text.muted} />
        <Text style={styles.backText}>Markets</Text>
      </Pressable>

      <View style={styles.header}>
        <Image source={{ uri: token.logoURI }} style={styles.logo} />
        <View style={styles.headerCopy}>
          <Text style={styles.symbol}>{token.symbol}</Text>
          <Text style={styles.name}>{token.name}</Text>
        </View>
      </View>

      <GlassCard padding={8} style={styles.chartCard}>
        <PriceChart chain={chain} address={token.address} livePrice={price} />
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <View style={styles.pairRow}>
          <View style={styles.pairCol}>
            <Text style={styles.label}>Buy enabled</Text>
            <Text style={[styles.flag, token.canBuy ? styles.flagOn : styles.flagOff]}>
              {token.canBuy ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.pairCol}>
            <Text style={styles.label}>Sell enabled</Text>
            <Text style={[styles.flag, token.canSell ? styles.flagOn : styles.flagOff]}>
              {token.canSell ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.pairCol}>
            <Text style={styles.label}>Chain</Text>
            <Text style={styles.flag}>{chain}</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.newsBlock}>
        <View style={styles.newsHeader}>
          <Text style={styles.section}>{token.symbol} news</Text>
          {displayNews.length > 5 ? (
            <Text style={styles.newsCount}>{displayNews.length} headlines</Text>
          ) : null}
        </View>
        {displayNews.length === 0 ? (
          <GlassCard padding={14} style={styles.card}>
            <Text style={styles.muted}>No recent news for {token.symbol}</Text>
          </GlassCard>
        ) : (
          <View style={styles.newsList}>
            {displayNews.slice(0, 5).map((item) => (
              <NewsCard key={item.id} item={item} variant="compact" />
            ))}
          </View>
        )}
      </View>

      <Pressable
        style={[styles.tradeBtn, isHalted && styles.tradeBtnDisabled]}
        onPress={handleTrade}
        disabled={isHalted}
      >
        <Text style={styles.tradeText}>{tradeLabel}</Text>
      </Pressable>

      <ConnectWalletModal
        visible={showConnect}
        onClose={() => setShowConnect(false)}
        onConnected={goToTrade}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg.primary },
  content: { padding: SPACING.base, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  backText: { color: COLORS.text.muted, fontWeight: '600' },
  header: { flexDirection: 'row', gap: SPACING.base, marginBottom: SPACING.base },
  logo: { width: 56, height: 56, borderRadius: RADIUS.sm },
  headerCopy: { flex: 1 },
  symbol: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: '900',
    fontFamily: FONTS.heading,
  },
  name: { color: COLORS.text.muted, marginTop: 2, fontFamily: FONTS.bodyRegular },
  card: { marginBottom: SPACING.sm },
  chartCard: { marginBottom: SPACING.base },
  section: {
    color: COLORS.text.primary,
    fontWeight: '800',
    marginBottom: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  label: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700' },
  flag: { color: COLORS.text.primary, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' },
  flagOn: { color: COLORS.green.primary },
  flagOff: { color: COLORS.red.primary },
  pairRow: { flexDirection: 'row', gap: SPACING.base, justifyContent: 'space-between' },
  pairCol: { flex: 1 },
  newsBlock: { marginBottom: SPACING.sm },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  newsCount: {
    color: COLORS.text.muted,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  newsList: { gap: SPACING.sm },
  tradeBtn: {
    marginTop: SPACING.sm,
    minHeight: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeBtnDisabled: { backgroundColor: COLORS.bg.elevated, opacity: 0.7 },
  tradeText: {
    color: COLORS.bg.primary,
    fontWeight: '900',
    fontSize: TYPOGRAPHY.sizes.md,
    letterSpacing: 0.3,
  },
  muted: { color: COLORS.text.muted, textAlign: 'center' },
  link: { color: COLORS.green.primary, marginTop: 12, fontWeight: '700' },
});
