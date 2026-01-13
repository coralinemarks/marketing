import React, { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { colors, radii } from '../constants/theme';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Web-safe slider (no native-only dependency).
 * - Uses the responder system (works on RN + RN Web)
 * - Value updates are deterministic with step rounding
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = colors.primary,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
}) {
  const trackW = useRef(1);

  const pct = useMemo(() => {
    if (max <= min) return 0;
    return clamp((value - min) / (max - min), 0, 1);
  }, [max, min, value]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const x = evt.nativeEvent.locationX ?? 0;
          onChange(valueFromX(x));
        },
        onPanResponderMove: (evt) => {
          const x = evt.nativeEvent.locationX ?? 0;
          onChange(valueFromX(x));
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, step, onChange]
  );

  function valueFromX(x: number) {
    const w = Math.max(1, trackW.current);
    const t = clamp(x / w, 0, 1);
    const raw = min + t * (max - min);
    const snapped = Math.round(raw / step) * step;
    return clamp(snapped, min, max);
  }

  return (
    <View
      style={styles.track}
      onLayout={(e) => {
        trackW.current = e.nativeEvent.layout.width;
      }}
      {...pan.panHandlers}
    >
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      <View style={[styles.thumb, { left: `${pct * 100}%`, borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    backgroundColor: '#EFE7DB',
    borderRadius: radii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.pill,
  },
  thumb: {
    position: 'absolute',
    top: -4,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 2,
    marginLeft: -11,
  },
});

