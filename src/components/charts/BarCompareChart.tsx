import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { formatMoneyCompact } from '../../utils/marketingIntelligence';

type Item = {
  label: string;
  value: number;
  color: string;
};

export function BarCompareChart({
  items,
  height = 140,
}: {
  items: Item[];
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  const padding = 14;
  const barH = 14;
  const gapY = 18;

  const max = useMemo(() => Math.max(1, ...items.map((i) => i.value)), [items]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[styles.wrap, { height }]}>
      {width <= 0 ? (
        <Text style={styles.empty}>—</Text>
      ) : (
        <Svg width={width} height={height}>
          {items.map((it, idx) => {
            const y = padding + idx * gapY;
            const w = ((width - padding * 2) * it.value) / max;
            return (
              <React.Fragment key={it.label}>
                <SvgText x={padding} y={y - 2} fontSize={11} fill={colors.mutedText}>
                  {it.label} • {formatMoneyCompact(it.value)}
                </SvgText>
                <Rect
                  x={padding}
                  y={y + 4}
                  width={width - padding * 2}
                  height={barH}
                  rx={8}
                  fill="#F2ECE2"
                />
                <Rect x={padding} y={y + 4} width={Math.max(8, w)} height={barH} rx={8} fill={it.color} />
              </React.Fragment>
            );
          })}
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
    padding: spacing.md,
  },
  empty: {
    fontSize: typography.small,
    color: colors.mutedText,
  },
});

