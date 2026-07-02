import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { GlassCard, ScreenContainer, Button } from '../../../shared/components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../core/theme';
import { WalletChain } from '../../../shared/types';
import { useWalletStore } from '../../wallet/store/useWalletStore';
import { useAuthSession, useLogin, useLogout } from '../../auth/hooks';
import { defaultWalletSigner } from '../../auth/utils';
import { useSettingsStore } from '../store/useSettingsStore';

const CHAINS: WalletChain[] = ['ethereum', 'mantle', 'solana'];

export const SettingsScreen: React.FC = () => {
  const { chain, setChain } = useWalletStore();
  const { hapticsEnabled, setHapticsEnabled } = useSettingsStore();
  const { session, isAuthenticated } = useAuthSession();
  const login = useLogin(defaultWalletSigner);
  const logout = useLogout();
  const [walletInput, setWalletInput] = useState('');

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Settings</Text>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Wallet</Text>

        {isAuthenticated && session ? (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, styles.green]}>Connected</Text>
            </View>
            <Text style={styles.address} numberOfLines={1}>
              {session.wallet}
            </Text>
            <Text style={styles.expiry}>
              Session expires {new Date(session.expiresAt * 1000).toLocaleString()}
            </Text>
            <Button
              label={logout.isPending ? 'Disconnecting…' : 'Disconnect'}
              variant="outline"
              fullWidth
              disabled={logout.isPending}
              onPress={() => logout.mutate()}
              style={styles.actionButton}
            />
          </>
        ) : (
          <>
            <TextInput
              value={walletInput}
              onChangeText={setWalletInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="0x... wallet address"
              placeholderTextColor={COLORS.text.muted}
              style={styles.input}
            />
            <Button
              label={login.isPending ? 'Connecting…' : 'Connect Wallet'}
              variant="outline"
              fullWidth
              disabled={!walletInput.trim() || login.isPending}
              onPress={() => login.mutate(walletInput.trim())}
              style={styles.actionButton}
            />
            {login.isError ? <Text style={styles.error}>{login.error.message}</Text> : null}
          </>
        )}
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Network</Text>
        <View style={styles.chainGrid}>
          {CHAINS.map((value) => (
            <Button
              key={value}
              label={value[0].toUpperCase() + value.slice(1)}
              variant="pill"
              size="sm"
              active={chain === value}
              onPress={() => setChain(value)}
              style={styles.chainButton}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Haptics & sounds</Text>
          <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
        </View>
      </GlassCard>
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
  card: { marginBottom: SPACING.base },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '900',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.base,
    marginTop: 10,
  },
  label: { color: COLORS.text.muted, fontWeight: '700' },
  value: { color: COLORS.text.primary, fontWeight: '800' },
  green: { color: COLORS.green.primary },
  address: { color: COLORS.text.secondary, marginTop: 10, fontFamily: TYPOGRAPHY.fonts.mono },
  expiry: { color: COLORS.text.muted, marginTop: 4, fontSize: TYPOGRAPHY.sizes.xs },
  chainGrid: { flexDirection: 'row', gap: 8 },
  chainButton: { flex: 1 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    backgroundColor: COLORS.bg.secondary,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  actionButton: { marginTop: 10 },
  error: { color: COLORS.red.primary, fontSize: TYPOGRAPHY.sizes.sm, marginTop: 8 },
});
