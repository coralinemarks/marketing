import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../constants/theme';

/**
 * Simple radial gauge (0..1) using SVG strokes.
 * Web-safe and deterministic.
 */
export function RadialGauge({
  value,
  size = 160,
  thickness = 14,
  color = colors.primary,
  label,
  subtitle,
}: {
  value: number; // 0..1
  size?: number;
  thickness?: number;
  color?: string;
  label: string;
  subtitle?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = useMemo(() => `${circ * v} ${circ}`, [circ, v]);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={colors.border} strokeWidth={thickness} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={dash}
          strokeDashoffset={circ * 0.25} // start at top
          strokeLinecap="round"
          rotation={-90}
          originX={c}
          originY={c}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.value}>{Math.round(v * 100)}%</Text>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
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
  value: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
  },
  label: {
    marginTop: 2,
    fontSize: typography.small,
    fontWeight: '800',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: typography.small,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: typography.small * 1.4,
  },
});

