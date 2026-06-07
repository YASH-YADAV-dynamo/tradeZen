import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '../../src/components/common/GlassCard';
import { useHaptics } from '../../src/hooks/useHaptics';
import { IS_DEV_MODE, friendlyError } from '../../src/config/env';
import { SUPPORTED_CHAINS } from '../../src/constants/chains';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useWalletStore } from '../../src/store/walletStore';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';
import { ConnectWalletModal, useWallet } from '../../src/wallet';

const shorten = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
  const { onTap } = useHaptics();
  const wallet = useWallet();
  const address = useWalletStore((s) => s.address);
  const chain = useWalletStore((s) => s.chain);
  const jwt = useWalletStore((s) => s.jwt);
  const setChain = useWalletStore((s) => s.setChain);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const [showConnect, setShowConnect] = useState(false);

  const connected = !!address;
  const authed = !!jwt;

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Settings</Text>

      <GlassCard padding={16} style={styles.card}>
        <Text style={styles.cardTitle}>Wallet</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, connected ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.statusText}>
            {!connected
              ? 'Not connected'
              : authed
                ? 'Connected & authenticated'
                : 'Connected · sign in required'}
          </Text>
        </View>
        {connected ? (
          <>
            <Text style={styles.address}>{shorten(address!)}</Text>
            {IS_DEV_MODE && wallet.source ? (
              <Text style={styles.sourceText}>via {wallet.source}</Text>
            ) : null}
            <View style={styles.actionRow}>
              {!authed ? (
                <Pressable
                  style={[styles.btn, styles.btnPrimary, wallet.isAuthenticating && styles.btnDisabled]}
                  onPress={() => {
                    onTap();
                    void wallet.authenticate();
                  }}
                  disabled={wallet.isAuthenticating}
                >
                  <Text style={styles.btnPrimaryText}>
                    {wallet.isAuthenticating ? 'Signing…' : 'Sign in'}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => {
                  onTap();
                  void wallet.disconnect();
                }}
              >
                <Text style={styles.btnSecondaryText}>Disconnect</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => {
              onTap();
              setShowConnect(true);
            }}
          >
            <Text style={styles.btnPrimaryText}>Connect wallet</Text>
          </Pressable>
        )}
        {wallet.lastError ? (
          <Text style={styles.errorText}>{friendlyError(wallet.lastError)}</Text>
        ) : null}
      </GlassCard>

      <GlassCard padding={16} style={styles.card}>
        <Text style={styles.cardTitle}>Network</Text>
        <View style={styles.chainGrid}>
          {SUPPORTED_CHAINS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setChain(value)}
              style={[styles.chainButton, chain === value && styles.chainActive]}
            >
              <Text style={[styles.chainText, chain === value && styles.chainTextActive]}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <GlassCard padding={16} style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>Haptics & sounds</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            thumbColor={hapticsEnabled ? COLORS.green.primary : undefined}
          />
        </View>
      </GlassCard>

      <ConnectWalletModal visible={showConnect} onClose={() => setShowConnect(false)} />
    </ScrollView>
  );
}

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
  card: { marginBottom: SPACING.base },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    marginBottom: 12,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: COLORS.green.primary },
  dotOff: { backgroundColor: COLORS.text.muted },
  statusText: { color: COLORS.text.primary, fontWeight: '700' },
  address: {
    color: COLORS.text.secondary,
    marginTop: 10,
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  sourceText: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  btn: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  btnPrimary: { backgroundColor: COLORS.green.primary },
  btnPrimaryText: { color: COLORS.bg.primary, fontWeight: '900' },
  btnSecondary: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  btnSecondaryText: { color: COLORS.text.primary, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  errorText: {
    color: COLORS.red.primary,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 8,
  },
  chainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chainButton: {
    minWidth: '30%',
    flexGrow: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  chainActive: { backgroundColor: COLORS.green.subtle, borderColor: COLORS.green.primary },
  chainText: {
    color: COLORS.text.muted,
    fontWeight: '800',
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
  },
  chainTextActive: { color: COLORS.green.primary },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLabel: { color: COLORS.text.primary, fontWeight: '700' },
});
