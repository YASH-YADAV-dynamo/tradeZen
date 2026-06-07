import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { useTokenChart } from '../../api/hooks';
import type { ChainSlug } from '../../api/types';
import { selection } from '../../platform/haptics';
import { IS_NATIVE } from '../../platform';
import { type ChartPoint, type ChartRange } from '../../services/coingecko';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  RADIUS,
  SPACING,
} from '../../theme';
import { formatUSD } from '../../utils/format';

interface PriceChartProps {
  chain: ChainSlug;
  address: string | null;
  livePrice?: number;
}

const RANGES: { id: ChartRange; label: string }[] = [
  { id: '1', label: '1D' },
  { id: '7', label: '1W' },
  { id: '30', label: '1M' },
  { id: '90', label: '3M' },
  { id: '365', label: '1Y' },
];

const CHART_HEIGHT = 320;
const PLOT_HEIGHT = 260;
const MAX_POINTS = 72;

type ChartDatum = {
  value: number;
  label: string;
  timestamp: number;
};

export const PriceChart: React.FC<PriceChartProps> = ({ chain, address, livePrice }) => {
  const [range, setRange] = useState<ChartRange>('7');
  const { data, isLoading } = useTokenChart(chain, address, range);
  const [parentW, setParentW] = useState(320);
  const [scrub, setScrub] = useState<{ value: number; timestamp: number } | null>(null);
  const lastHapticIdx = useRef(-1);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setParentW(w);
  }, []);

  const series = useMemo(() => {
    if (!data?.points?.length) return null;
    const sampled = downsample(data.points, MAX_POINTS);
    const labelEvery = Math.max(1, Math.floor(sampled.length / 4));
    const chartData: ChartDatum[] = sampled.map((p, i) => ({
      value: p.v,
      timestamp: p.t,
      label: i % labelEvery === 0 || i === sampled.length - 1 ? formatAxisTime(p.t, range) : '',
    }));
    const values = sampled.map((p) => p.v);
    return {
      chartData,
      high: Math.max(...values),
      low: Math.min(...values),
      open: sampled[0].v,
      close: sampled[sampled.length - 1].v,
      spacing: Math.max(4, (parentW - 72) / Math.max(chartData.length - 1, 1)),
    };
  }, [data, range, parentW]);

  const bumpHaptic = useCallback((index: number) => {
    if (!IS_NATIVE || index === lastHapticIdx.current) return;
    lastHapticIdx.current = index;
    try {
      selection();
    } catch {
      // Haptics unavailable in Expo Go / simulator — never crash the chart.
    }
  }, []);

  const syncScrub = useCallback(
    (index: number) => {
      if (!series || index < 0 || index >= series.chartData.length) return;
      const point = series.chartData[index];
      setScrub({ value: point.value, timestamp: point.timestamp });
      bumpHaptic(index);
    },
    [bumpHaptic, series]
  );

  const pointerLabelComponent = useCallback(
    (items: { value?: number }[], _secondary: unknown, index?: number) => {
      const value = items[0]?.value;
      if (value == null) return null;
      const idx =
        typeof index === 'number' && index >= 0
          ? index
          : series?.chartData.findIndex((d) => d.value === value) ?? -1;
      const point = idx >= 0 && series ? series.chartData[idx] : null;
      return (
        <>
          {idx >= 0 ? <ScrubSync index={idx} onSync={syncScrub} /> : null}
          <View style={styles.pointerBubble}>
            <Text style={styles.pointerPrice}>{formatUSD(value)}</Text>
            {point ? (
              <Text style={styles.pointerTime}>{formatChartTime(point.timestamp, range)}</Text>
            ) : null}
          </View>
        </>
      );
    },
    [range, series, syncScrub]
  );

  const changePct = data?.changePct ?? 0;
  const positive = changePct >= 0;
  const stroke = positive ? COLORS.green.primary : COLORS.red.primary;

  const displayPrice = scrub?.value ?? series?.close ?? livePrice;
  const displayTime = scrub ? formatChartTime(scrub.timestamp, range) : null;

  const handleRange = (id: ChartRange) => {
    setRange(id);
    setScrub(null);
    lastHapticIdx.current = -1;
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerMain}>
          <Text style={styles.priceText}>
            {typeof displayPrice === 'number' ? formatUSD(displayPrice) : '--'}
          </Text>
          {data?.points?.length ? (
            <Text style={[styles.changeText, positive ? styles.changeUp : styles.changeDown]}>
              {positive ? '+' : ''}
              {changePct.toFixed(2)}%
              <Text style={styles.changeMuted}> over {rangeLabel(range)}</Text>
            </Text>
          ) : (
            <Text style={styles.changeMuted}>Live mid price</Text>
          )}
          {scrub && displayTime ? (
            <Text style={styles.scrubTime}>{displayTime}</Text>
          ) : (
            <Text style={styles.scrubHint}>Touch and drag the chart</Text>
          )}
        </View>
      </View>

      {series ? (
        <View style={styles.statsRow}>
          <Stat label="Open" value={series.open} />
          <Stat label="High" value={series.high} positive />
          <Stat label="Low" value={series.low} negative />
          <Stat label="Close" value={series.close} />
        </View>
      ) : null}

      <View style={styles.chartShell} onLayout={onLayout}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.green.primary} />
          </View>
        ) : series ? (
          <LineChart
            data={series.chartData}
            parentWidth={parentW}
            height={PLOT_HEIGHT}
            areaChart
            curved
            hideDataPoints
            spacing={series.spacing}
            initialSpacing={10}
            endSpacing={12}
            color={stroke}
            thickness={2.5}
            startFillColor={stroke}
            endFillColor={stroke}
            startOpacity={0.35}
            endOpacity={0.02}
            yAxisLabelWidth={52}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            rulesType="dashed"
            rulesColor={COLORS.chart.grid}
            yAxisColor="transparent"
            xAxisColor={COLORS.border.muted}
            noOfSections={4}
            formatYLabel={(v) => compactUsd(Number(v))}
            backgroundColor={COLORS.bg.secondary}
            adjustToWidth
            disableScroll
            pointerConfig={{
              pointerStripHeight: PLOT_HEIGHT,
              pointerStripColor: COLORS.chart.cursor,
              pointerStripWidth: 1,
              pointerColor: stroke,
              radius: 6,
              pointerLabelWidth: 130,
              pointerLabelHeight: 56,
              activatePointersOnLongPress: false,
              activatePointersInstantlyOnTouch: true,
              persistPointer: true,
              resetPointerIndexOnRelease: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent,
            }}
          />
        ) : (
          <View style={styles.center}>
            <Text style={styles.empty}>
              {typeof livePrice === 'number'
                ? 'Historical chart unavailable for this pair'
                : 'Loading price…'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map(({ id, label }) => (
          <Pressable
            key={id}
            onPress={() => handleRange(id)}
            style={[styles.rangeBtn, range === id && styles.rangeBtnActive]}
          >
            <Text style={[styles.rangeText, range === id && styles.rangeTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

/** Defers scrub state updates out of gifted-charts' render path (avoids RN crashes). */
const ScrubSync: React.FC<{ index: number; onSync: (index: number) => void }> = ({
  index,
  onSync,
}) => {
  useEffect(() => {
    onSync(index);
  }, [index, onSync]);
  return null;
};

const Stat: React.FC<{ label: string; value: number; positive?: boolean; negative?: boolean }> = ({
  label,
  value,
  positive,
  negative,
}) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, positive && styles.statUp, negative && styles.statDown]}>
      {formatUSD(value)}
    </Text>
  </View>
);

function downsample(points: ChartPoint[], max: number): ChartPoint[] {
  if (points.length <= max) return points;
  const out: ChartPoint[] = [];
  const step = (points.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) {
    out.push(points[Math.round(i * step)]);
  }
  return out;
}

const compactUsd = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `$${(v / 1_000).toFixed(1)}k`;
  if (v >= 1000) return `$${(v / 1000).toFixed(2)}k`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  if (v >= 0.01) return `$${v.toFixed(3)}`;
  return `$${v.toExponential(1)}`;
};

const formatAxisTime = (ms: number, range: ChartRange): string => {
  const d = new Date(ms);
  if (range === '1') {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (range === '365') {
    return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatChartTime = (ms: number, range: ChartRange): string => {
  const d = new Date(ms);
  if (range === '1') {
    return d.toLocaleString(undefined, {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const rangeLabel = (r: ChartRange) => {
  switch (r) {
    case '1':
      return '24h';
    case '7':
      return '7d';
    case '30':
      return '30d';
    case '90':
      return '3m';
    case '365':
      return '1y';
    default:
      return r;
  }
};

const styles = StyleSheet.create({
  wrap: { gap: SPACING.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerMain: { flex: 1 },
  priceText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '900',
    fontFamily: FONTS.mono,
  },
  changeText: {
    marginTop: 2,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  changeUp: { color: COLORS.green.primary },
  changeDown: { color: COLORS.red.primary },
  changeMuted: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontWeight: '500',
  },
  scrubTime: {
    marginTop: 4,
    color: COLORS.text.secondary,
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.xs,
  },
  scrubHint: {
    marginTop: 4,
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: FONT_SIZES.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  stat: { flex: 1 },
  statLabel: {
    color: COLORS.text.muted,
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    color: COLORS.text.primary,
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginTop: 2,
  },
  statUp: { color: COLORS.green.primary },
  statDown: { color: COLORS.red.primary },
  chartShell: {
    minHeight: CHART_HEIGHT,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg.secondary,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border.muted,
  },
  axisText: {
    color: COLORS.chart.axis,
    fontSize: 9,
    fontFamily: FONTS.monoRegular,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.base },
  empty: { color: COLORS.text.muted, textAlign: 'center', fontFamily: FONTS.bodyRegular },
  pointerBubble: {
    backgroundColor: COLORS.bg.elevated,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pointerPrice: {
    color: COLORS.text.primary,
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  pointerTime: {
    color: COLORS.text.muted,
    fontFamily: FONTS.monoRegular,
    fontSize: 10,
    marginTop: 2,
  },
  rangeRow: { flexDirection: 'row', gap: 6 },
  rangeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.secondary,
  },
  rangeBtnActive: {
    borderColor: COLORS.green.primary,
    backgroundColor: COLORS.green.subtle,
  },
  rangeText: {
    color: COLORS.text.muted,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  rangeTextActive: { color: COLORS.green.primary },
});
