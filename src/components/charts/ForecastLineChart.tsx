import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../constants/theme';
import type { ForecastPoint } from '../../types/intelligence';
import { formatMoneyCompact } from '../../utils/marketingIntelligence';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pathFromPoints(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ForecastLineChart({
  points,
  height = 190,
  mode = 'revenue',
}: {
  points: ForecastPoint[];
  height?: number;
  mode?: 'revenue' | 'profit';
}) {
  const [width, setWidth] = useState<number>(0);
  const reveal = useSharedValue(0);

  const padding = 18;
  const innerW = Math.max(0, width - padding * 2);
  const innerH = Math.max(0, height - padding * 2);

  const series = useMemo(() => {
    return points.map((p) => ({
      label: p.label,
      value: mode === 'profit' ? p.profitUsd : p.revenueUsd,
      note: p.note,
    }));
  }, [mode, points]);

  const yMax = useMemo(() => {
    const max = Math.max(1, ...series.map((p) => p.value));
    // If profit is negative, clamp at 1 so chart still renders; we’ll rely on tiles for sign.
    return Math.max(1, max);
  }, [series]);

  const xy = useMemo(() => {
    if (innerW <= 0 || innerH <= 0 || series.length === 0) return [];
    const n = series.length;
    return series.map((d, i) => {
      const x = padding + (n === 1 ? 0 : (i / (n - 1)) * innerW);
      const normalized = clamp(d.value / yMax, 0, 1);
      const y = padding + (1 - normalized) * innerH;
      return { x, y, label: d.label, value: d.value, note: d.note };
    });
  }, [innerH, innerW, padding, series, yMax]);

  const path = useMemo(() => pathFromPoints(xy), [xy]);

  const pathLength = useMemo(() => {
    if (xy.length <= 1) return 1;
    let len = 0;
    for (let i = 1; i < xy.length; i++) {
      const dx = xy[i].x - xy[i - 1].x;
      const dy = xy[i].y - xy[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(1, len);
  }, [xy]);

  useEffect(() => {
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: 850 });
  }, [path, reveal]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: pathLength * (1 - reveal.value),
    } as any;
  }, [pathLength]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== width) setWidth(w);
  };

  const highlightIdx = useMemo(() => {
    // Pick two strongest month-to-month increases as “inflection points”.
    const deltas = series.map((p, i) => (i === 0 ? 0 : p.value - series[i - 1].value));
    const ranked = deltas
      .map((d, i) => ({ d, i }))
      .filter((x) => x.i > 0)
      .sort((a, b) => b.d - a.d)
      .slice(0, 2)
      .map((x) => x.i);
    return new Set(ranked);
  }, [series]);

  const stroke = mode === 'profit' ? colors.success : colors.primary;

  return (
    <View onLayout={onLayout} style={[styles.wrap, { height }]}>
      {width <= 0 || series.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No projection yet.</Text>
        </View>
      ) : (
        <Svg width={width} height={height}>
          {/* baseline grid */}
          {[0.25, 0.5, 0.75].map((t, idx) => {
            const y = padding + t * innerH;
            return (
              <Line
                key={idx}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
              />
            );
          })}

          {/* top label */}
          <SvgText x={padding} y={padding - 6} fontSize={11} fill={colors.mutedText}>
            {formatMoneyCompact(yMax)}
          </SvgText>

          {/* line */}
          <AnimatedPath
            d={path}
            stroke={stroke}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${pathLength} ${pathLength}`}
            animatedProps={animatedProps}
          />

          {/* markers */}
          {xy.map((p, idx) => {
            const highlight = highlightIdx.has(idx);
            return (
              <React.Fragment key={`${p.label}_${idx}`}>
                {highlight ? (
                  <Circle cx={p.x} cy={p.y} r={8} fill={`${stroke}22`} />
                ) : null}
                <Circle cx={p.x} cy={p.y} r={4} fill={stroke} />
              </React.Fragment>
            );
          })}

          {/* x labels */}
          {xy
            .filter((_, i) => i === 0 || i === xy.length - 1 || i === Math.floor(xy.length / 2))
            .map((p, idx) => (
              <SvgText
                key={`${p.label}_x_${idx}`}
                x={p.x}
                y={height - 4}
                fontSize={11}
                fill={colors.mutedText}
                textAnchor="middle"
              >
                {p.label}
              </SvgText>
            ))}

          {/* annotations (first 2) */}
          {xy
            .filter((p) => p.note)
            .slice(0, 2)
            .map((p, idx) => (
              <SvgText
                key={`${p.label}_note_${idx}`}
                x={clamp(p.x + 8, padding, width - padding)}
                y={clamp(p.y - 10, padding + 10, height - padding)}
                fontSize={11}
                fill={colors.mutedText}
                textAnchor="start"
              >
                {p.note}
              </SvgText>
            ))}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '700',
  },
});

