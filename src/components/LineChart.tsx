import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { MarketingProjectionPoint } from '../types/marketing';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pathFromPoints(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function LineChart({
  data,
  height = 180,
}: {
  data: MarketingProjectionPoint[];
  height?: number;
}) {
  const [width, setWidth] = useState<number>(0);
  const reveal = useSharedValue(0);

  const padding = 18;
  const innerW = Math.max(0, width - padding * 2);
  const innerH = Math.max(0, height - padding * 2);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== width) setWidth(w);
  };

  const safeData = useMemo(() => data.filter((d) => Number.isFinite(d.value)), [data]);

  const points = useMemo(() => {
    if (innerW <= 0 || innerH <= 0 || safeData.length === 0) return [];
    const n = safeData.length;
    return safeData.map((d, i) => {
      const x = padding + (n === 1 ? 0 : (i / (n - 1)) * innerW);
      // Chart is 0..100. Flip Y axis for SVG coordinates.
      const y = padding + (1 - clamp(d.value, 0, 100) / 100) * innerH;
      return { x, y, v: d.value, label: d.label };
    });
  }, [innerW, innerH, padding, safeData]);

  const path = useMemo(() => pathFromPoints(points), [points]);

  // Approximate path length so we can animate strokeDashoffset.
  const pathLength = useMemo(() => {
    if (points.length <= 1) return 1;
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(1, len);
  }, [points]);

  useEffect(() => {
    // Restart animation whenever data/path changes.
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: 750 });
  }, [path, reveal]);

  const animatedProps = useAnimatedProps(() => {
    // Draw from left to right.
    return {
      strokeDashoffset: pathLength * (1 - reveal.value),
    } as any;
  }, [pathLength]);

  const grid = [0, 25, 50, 75, 100];

  return (
    <View onLayout={onLayout} style={[styles.wrap, { height }]}>
      {width <= 0 || safeData.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No data yet.</Text>
        </View>
      ) : (
        <Svg width={width} height={height}>
          {/* grid + labels */}
          {grid.map((g) => {
            const y = padding + (1 - g / 100) * innerH;
            return (
              <React.Fragment key={g}>
                <Line x1={padding} y1={y} x2={width - padding} y2={y} stroke={colors.border} strokeWidth={1} />
                <SvgText
                  x={padding - 6}
                  y={y + 4}
                  fontSize={11}
                  fill={colors.mutedText}
                  textAnchor="end"
                >
                  {g}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* line */}
          <AnimatedPath
            d={path}
            stroke={colors.primary}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${pathLength} ${pathLength}`}
            animatedProps={animatedProps}
          />

          {/* markers */}
          {points.map((p, idx) => (
            <Circle key={`${p.label}_${idx}`} cx={p.x} cy={p.y} r={4} fill={colors.primary} />
          ))}

          {/* x labels (sparse) */}
          {points
            .filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2))
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

          {/* annotations (show the first couple that exist, to keep it readable) */}
          {safeData
            .map((d, i) => ({ d, p: points[i] }))
            .filter((x) => x.d?.note && x.p)
            .slice(0, 2)
            .map(({ d, p }, idx) => (
              <React.Fragment key={`${d.label}_note_${idx}`}>
                <Circle cx={p.x} cy={p.y} r={7} fill="rgba(29, 78, 216, 0.14)" />
                <SvgText
                  x={clamp(p.x + 8, padding, width - padding)}
                  y={clamp(p.y - 10, padding + 10, height - padding)}
                  fontSize={11}
                  fill={colors.mutedText}
                  textAnchor="start"
                >
                  {d.note}
                </SvgText>
              </React.Fragment>
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
  },
});

