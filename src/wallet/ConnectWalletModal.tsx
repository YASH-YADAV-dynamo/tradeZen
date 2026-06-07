import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IS_DEV_MODE, friendlyError } from '../config/env';
import { useHaptics } from '../hooks/useHaptics';
import { IS_WEB } from '../platform';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  RADIUS,
  SHADOWS,
  SPACING,
} from '../theme';
import { isPrivyConfigured } from '../config/wallet';
import type { WalletAdapter } from './types';
import { useWallet } from './WalletProvider';

interface ConnectWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onConnected?: () => void;
  authenticate?: boolean;
}

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

const ADAPTER_META: Record<
  WalletAdapter['id'],
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  privy: {
    title: 'Privy',
    subtitle: 'Email, social login, or WalletConnect',
    icon: 'shield-checkmark-outline',
  },
  walletconnect: {
    title: 'WalletConnect',
    subtitle: 'Scan QR with MetaMask, Rainbow, Trust, etc.',
    icon: 'qr-code-outline',
  },
  'web-injected': {
    title: 'Browser extension',
    subtitle: 'MetaMask, Rabby, Coinbase Wallet',
    icon: 'wallet-outline',
  },
  manual: {
    title: 'Manual address',
    subtitle: 'Dev only — read-only, cannot sign',
    icon: 'code-slash-outline',
  },
};

/**
 * Cross-platform connect-wallet sheet.
 *
 * On native iOS / Android it slides up from the bottom with a drag handle
 * (standard mobile bottom-sheet UX, dismissable by swiping down). On web
 * it renders as a centered card over a backdrop.
 */
export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  visible,
  onClose,
  onConnected,
  authenticate = true,
}) => {
  const wallet = useWallet();
  const insets = useSafeAreaInsets();
  const { onTap, onSuccess, onError } = useHaptics();
  const [manualAddress, setManualAddress] = useState('');
  const [busyAdapter, setBusyAdapter] = useState<WalletAdapter['id'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Slide-up animation for native; instant for web (centered card).
  useEffect(() => {
    if (IS_WEB) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : 600,
        duration: visible ? 320 : 220,
        easing: Easing.bezier(0.2, 0, 0, 1),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 220 : 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, translateY, backdropOpacity]);

  useEffect(() => {
    if (!visible) {
      setBusyAdapter(null);
      setError(null);
    }
  }, [visible]);

  const adapters = useMemo(
    () =>
      wallet.availableAdapters.filter((id) => {
        if (id === 'privy' && !isPrivyConfigured()) return false;
        if (id === 'manual' && !IS_DEV_MODE) return false;
        return true;
      }),
    [wallet.availableAdapters]
  );

  // Swipe-down-to-close gesture for the sheet on native.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => !IS_WEB && g.dy > 8,
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 140 || g.vy > 1.2) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const handleConnect = async (adapter: WalletAdapter['id']) => {
    setError(null);
    onTap();
    setBusyAdapter(adapter);
    try {
      if (adapter === 'manual') {
        const candidate = manualAddress.trim();
        if (!ADDR_RE.test(candidate)) {
          throw new Error('Enter a valid 0x address (40 hex chars).');
        }
        await wallet.connect({ adapter, manualAddress: candidate });
      } else {
        await wallet.connect({ adapter });
      }
      if (authenticate && adapter !== 'manual') {
        await wallet.authenticate();
      }
      onSuccess();
      onConnected?.();
      onClose();
    } catch (err) {
      onError();
      setError(friendlyError(err, 'Could not connect wallet'));
    } finally {
      setBusyAdapter(null);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Connect wallet</Text>
      <Pressable hitSlop={12} onPress={onClose} style={styles.closeBtn}>
        <Ionicons name="close" size={22} color={COLORS.text.muted} />
      </Pressable>
    </View>
  );

  const renderBody = () => (
    <>
      <Text style={styles.subtitle}>
        Browse markets without connecting. A wallet is only needed to request quotes and trade.
      </Text>

      {adapters.map((id) => {
        const meta = ADAPTER_META[id];
        const busy = busyAdapter === id;
        if (id === 'manual') {
          return (
            <View key={id} style={styles.manualBlock}>
              <View style={styles.adapterIconWrap}>
                <Ionicons name={meta.icon} size={20} color={COLORS.amber.primary} />
              </View>
              <View style={styles.manualBody}>
                <Text style={styles.adapterTitle}>{meta.title}</Text>
                <Text style={styles.adapterSub}>{meta.subtitle}</Text>
                <TextInput
                  value={manualAddress}
                  onChangeText={setManualAddress}
                  placeholder="0xABC...123"
                  placeholderTextColor={COLORS.text.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Pressable
                  style={[styles.ctaSecondary, busy && styles.ctaDisabled]}
                  onPress={() => void handleConnect(id)}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color={COLORS.text.primary} />
                  ) : (
                    <Text style={styles.ctaSecondaryText}>Use this address</Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        }
        return (
          <Pressable
            key={id}
            style={[styles.adapterRow, busy && styles.ctaDisabled]}
            onPress={() => void handleConnect(id)}
            disabled={!!busyAdapter}
          >
            <View style={styles.adapterIconWrap}>
              <Ionicons name={meta.icon} size={20} color={COLORS.green.primary} />
            </View>
            <View style={styles.adapterCopy}>
              <Text style={styles.adapterTitle}>{meta.title}</Text>
              <Text style={styles.adapterSub}>{meta.subtitle}</Text>
            </View>
            {busy ? (
              <ActivityIndicator color={COLORS.green.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
            )}
          </Pressable>
        );
      })}

      {adapters.length === 0 ? (
        <Text style={styles.note}>
          No wallet provider configured. Add EXPO_PUBLIC_PRIVY_APP_ID to .env (recommended), or on
          web install MetaMask / set EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </>
  );

  if (IS_WEB) {
    return (
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.webCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardInner}>
              {renderHeader()}
              {renderBody()}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: Math.max(insets.bottom, SPACING.base),
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleBar} />
        <View style={styles.cardInner}>
          {renderHeader()}
          {renderBody()}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg.overlay,
    justifyContent: 'center',
    paddingHorizontal: SPACING.base,
  },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  webCard: {
    maxWidth: 460,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: COLORS.bg.sheet,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    ...SHADOWS.sheet,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bg.sheet,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    borderTopWidth: 1,
    borderColor: COLORS.border.default,
    paddingTop: SPACING.sm,
    ...SHADOWS.sheet,
  },
  handleBar: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border.accent,
    marginBottom: SPACING.sm,
  },
  cardInner: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    fontFamily: FONTS.heading,
  },
  closeBtn: { padding: 4 },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bodyRegular,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  adapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
  adapterIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.green.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adapterCopy: { flex: 1 },
  adapterTitle: {
    color: COLORS.text.primary,
    fontWeight: '700',
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
  },
  adapterSub: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  manualBlock: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.muted,
    backgroundColor: COLORS.bg.secondary,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  manualBody: { flex: 1, gap: SPACING.sm },
  input: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: SPACING.sm,
    color: COLORS.text.primary,
    backgroundColor: COLORS.bg.primary,
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
  },
  ctaSecondary: {
    minHeight: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    backgroundColor: COLORS.bg.primary,
  },
  ctaSecondaryText: {
    color: COLORS.text.primary,
    fontWeight: '700',
    fontFamily: FONTS.body,
  },
  ctaDisabled: { opacity: 0.6 },
  note: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bodyRegular,
    paddingVertical: SPACING.sm,
    textAlign: 'center',
  },
  error: {
    color: COLORS.red.primary,
    fontWeight: '600',
    fontFamily: FONTS.body,
    marginTop: 4,
  },
});
