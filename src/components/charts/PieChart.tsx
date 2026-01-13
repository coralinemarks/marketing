import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../constants/theme';

type Slice = {
  label: string;
  value: number; // percent, 0..100
  color: string;
};

export function PieChart({
  size = 160,
  thickness = 18,
  slices,
  centerLabel,
}: {
  size?: number;
  thickness?: number;
  slices: Slice[];
  centerLabel?: string;
}) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const normalized = useMemo(() => {
    const sum = slices.reduce((s, x) => s + x.value, 0);
    if (sum <= 0) return slices;
    return slices.map((s) => ({ ...s, value: (s.value / sum) * 100 }));
  }, [slices]);

  const arcs = useMemo(() => {
    let angle = 0;
    return normalized.map((s) => {
      const start = angle;
      const end = angle + (s.value / 100) * 360;
      angle = end;
      return { ...s, start, end };
    });
  }, [normalized]);

  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={colors.border} strokeWidth={thickness} fill="none" />
          <G>
            {arcs.map((a) => (
              <Circle
                key={a.label}
                cx={cx}
                cy={cy}
                r={r}
                stroke={a.color}
                strokeWidth={thickness}
                strokeDasharray={`${(a.value / 100) * 2 * Math.PI * r} ${2 * Math.PI * r}`}
                strokeDashoffset={-(a.start / 360) * 2 * Math.PI * r}
                strokeLinecap="butt"
                fill="none"
                rotation={-90}
                originX={cx}
                originY={cy}
              />
            ))}
          </G>
        </Svg>
        <View style={styles.center}>
          <Text style={styles.centerText}>{centerLabel ?? 'Allocation'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    borderRadius: radii.lg,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  centerText: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '800',
    textAlign: 'center',
  },
});

