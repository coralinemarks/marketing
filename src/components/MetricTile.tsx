import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';

/**
 * Dashboard metric tile with an optional inline tooltip.
 * Press the info icon to toggle the explanation.
 */
export function MetricTile({
  label,
  value,
  icon,
  color,
  help,
  footer,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  help?: string;
  footer?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.tile}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        {help ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Explain ${label}`}
            onPress={() => setOpen((v) => !v)}
            style={({ pressed }) => [styles.infoBtn, pressed ? styles.pressed : null]}
          >
            <Ionicons name="information-circle-outline" size={18} color={colors.mutedText} />
          </Pressable>
        ) : null}
      </View>

      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
      {help && open ? <Text style={styles.help}>{help}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  infoBtn: {
    padding: 6,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.8,
  },
  help: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.45,
  },
  footer: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.35,
  },
});

