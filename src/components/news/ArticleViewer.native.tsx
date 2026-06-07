import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import type { NewsItem } from '../../api/types';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

type Ctx = {
  open: (item: NewsItem) => void;
  close: () => void;
};

const ArticleViewerContext = createContext<Ctx | null>(null);

export const ArticleViewerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback((next: NewsItem) => {
    setItem(next);
    setLoading(true);
  }, []);

  const close = useCallback(() => setItem(null), []);

  const value = useMemo<Ctx>(() => ({ open, close }), [open, close]);
  const { top } = useSafeAreaInsets();

  return (
    <ArticleViewerContext.Provider value={value}>
      {children}
      <Modal visible={!!item} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
        {item ? (
          <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(top, SPACING.sm) }]}>
              <Pressable style={styles.iconBtn} onPress={close} hitSlop={8}>
                <Ionicons name="close" size={22} color={COLORS.text.primary} />
              </Pressable>
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {item.publisher || item.source}
                </Text>
                <Text style={styles.headerSub} numberOfLines={1}>
                  {hostname(item.url)}
                </Text>
              </View>
              <Pressable
                style={styles.iconBtn}
                hitSlop={8}
                onPress={() => Linking.openURL(item.url)}
                accessibilityLabel="Open in browser"
              >
                <Ionicons name="open-outline" size={20} color={COLORS.text.primary} />
              </Pressable>
            </View>

            <WebView
              source={{ uri: item.url }}
              originWhitelist={['*']}
              style={styles.web}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              startInLoadingState
              setSupportMultipleWindows={false}
            />

            {loading ? (
              <View pointerEvents="none" style={styles.loader}>
                <ActivityIndicator color={COLORS.green.primary} />
              </View>
            ) : null}
          </View>
        ) : null}
      </Modal>
    </ArticleViewerContext.Provider>
  );
};

export function useArticleViewer(): Ctx {
  const ctx = useContext(ArticleViewerContext);
  if (!ctx) throw new Error('useArticleViewer must be used within <ArticleViewerProvider>');
  return ctx;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.bg.elevated,
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg.primary,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: COLORS.text.primary,
    fontWeight: '700',
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.sizes.sm,
    textTransform: 'capitalize',
  },
  headerSub: {
    color: COLORS.text.muted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
    fontFamily: FONTS.bodyRegular,
  },
  web: { flex: 1, backgroundColor: COLORS.bg.primary },
  loader: {
    position: 'absolute',
    inset: 0 as unknown as number,
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
});
