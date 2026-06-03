import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassCard } from '../../src/components/common/GlassCard';
import { useSettingsStore, useWalletStore } from '../../src/store';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../src/theme';

const CHAINS = ['Ethereum', 'Mantle', 'Solana'] as const;

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
  const { address, chain, setAddress, setChain } = useWalletStore();
  const { hapticsEnabled, setHapticsEnabled } = useSettingsStore();

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: Math.max(top, SPACING.sm) }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Settings</Text>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Wallet</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{address ? 'Connected' : 'Disconnected'}</Text>
        </View>
        <TextInput
          value={address ?? ''}
          onChangeText={(value) => setAddress(value.trim() ? value.trim() : null)}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="0x... wallet address"
          placeholderTextColor={COLORS.text.muted}
          style={styles.input}
        />
        {address ? <Text style={styles.address}>{address}</Text> : null}
      </GlassCard>

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Network</Text>
        <View style={styles.chainGrid}>
          {CHAINS.map((value) => (
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

      <GlassCard padding={14} style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Haptics & sounds</Text>
          <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
        </View>
      </GlassCard>
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.base,
    marginTop: 10,
  },
  label: { color: COLORS.text.muted, fontWeight: '700' },
  value: { color: COLORS.text.primary, fontWeight: '800' },
  address: { color: COLORS.text.secondary, marginTop: 10, fontFamily: TYPOGRAPHY.fonts.mono },
  chainGrid: { flexDirection: 'row', gap: 8 },
  chainButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  chainActive: { backgroundColor: COLORS.green.subtle, borderColor: COLORS.green.primary },
  chainText: { color: COLORS.text.muted, fontWeight: '800', fontSize: TYPOGRAPHY.sizes.xs },
  chainTextActive: { color: COLORS.green.primary },
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
});
