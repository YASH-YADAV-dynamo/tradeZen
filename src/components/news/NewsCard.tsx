import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { NewsItem } from '../../api/types';
import { COLORS, FONTS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { useArticleViewer } from './ArticleViewer';
import { BreakingPill, ImportantPill, SentimentPill } from './NewsBadge';

export type NewsCardVariant = 'feed' | 'compact' | 'carousel';

interface Props {
  item: NewsItem;
  variant?: NewsCardVariant;
  onPress?: (item: NewsItem) => void;
}

/**
 * Single news row. Tapping opens the in-app reader (native WebView modal,
 * web new tab — see ArticleViewer). Variants:
 *   - `feed`     full-width row, with image, used in NewsFeed
 *   - `compact`  dense row without image, used in token detail
 *   - `carousel` 280px-wide card, used in the markets news strip
 */
export const NewsCard: React.FC<Props> = ({ item, variant = 'feed', onPress }) => {
  const reader = useArticleViewer();

  const handlePress = () => {
    if (onPress) onPress(item);
    else reader.open(item);
  };

  const relative = useMemo(() => relativeTime(item.publishedAt), [item.publishedAt]);
  const tickers = useMemo(() => dedupTickers(item).slice(0, 3), [item]);
  const isCarousel = variant === 'carousel';
  const isCompact = variant === 'compact';
  const showImage = !isCompact && !!item.imageUrl;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.root,
        isCarousel && styles.rootCarousel,
        isCompact && styles.rootCompact,
        pressed && styles.rootPressed,
      ]}
      accessibilityRole="link"
      accessibilityLabel={item.title}
    >
      {showImage ? (
        <Image source={{ uri: item.imageUrl ?? undefined }} style={isCarousel ? styles.imageCarousel : styles.image} />
      ) : null}

      <View style={styles.body}>
        <View style={styles.badgeRow}>
          {item.importance === 3 ? <BreakingPill /> : item.importance === 2 ? <ImportantPill /> : null}
          <SentimentPill sentiment={item.sentiment} />
          {tickers.length > 0 ? (
            <View style={styles.tickers}>
              {tickers.map((t) => (
                <Text key={t} style={styles.ticker}>
                  {t}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <Text
          style={[styles.title, isCarousel && styles.titleCarousel, isCompact && styles.titleCompact]}
          numberOfLines={isCarousel ? 3 : isCompact ? 2 : 2}
        >
          {item.title}
        </Text>

        {!isCarousel && !isCompact && item.summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {item.summary}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaSource} numberOfLines={1}>
            {item.publisher || item.source}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaTime}>{relative}</Text>
        </View>
      </View>
    </Pressable>
  );
};

function relativeTime(unixSec: number): string {
  if (!unixSec) return '';
  const now = Date.now() / 1000;
  const delta = Math.max(0, now - unixSec);
  if (delta < 60) return 'just now';
  if (delta < 3600) return `${Math.floor(delta / 60)}m`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
  if (delta < 604800) return `${Math.floor(delta / 86400)}d`;
  return new Date(unixSec * 1000).toLocaleDateString();
}

function dedupTickers(item: NewsItem): string[] {
  const out = new Set<string>();
  if (item.tokenSymbol) out.add(item.tokenSymbol.toUpperCase());
  for (const s of item.relatedSymbols ?? []) {
    if (s) out.add(s.toUpperCase());
  }
  return Array.from(out);
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.bg.elevated,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border.muted,
    padding: SPACING.base,
    flexDirection: 'row',
    gap: SPACING.base,
  },
  rootCompact: {
    padding: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  rootCarousel: {
    width: 280,
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden',
  },
  rootPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg.primary,
  },
  imageCarousel: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.bg.primary,
  },
  body: { flex: 1, gap: 6, padding: 0 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tickers: { flexDirection: 'row', gap: 4, marginLeft: 'auto' },
  ticker: {
    color: COLORS.green.primary,
    fontFamily: FONTS.mono,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: COLORS.green.subtle,
    borderRadius: RADIUS.xs,
  },
  title: {
    color: COLORS.text.primary,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 20,
  },
  titleCarousel: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  titleCompact: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 18 },
  summary: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaSource: {
    color: COLORS.text.secondary,
    fontFamily: FONTS.body,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
  },
  metaDot: { color: COLORS.text.muted, fontSize: TYPOGRAPHY.sizes.xs },
  metaTime: {
    color: COLORS.text.muted,
    fontFamily: FONTS.mono,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
});
