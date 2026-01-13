import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';

export function BadgeChip({
  icon,
  label,
  tone = 'neutral',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'neutral' | 'good';
}) {
  const good = tone === 'good';
  return (
    <View style={[styles.chip, good ? styles.good : styles.neutral]}>
      <Ionicons
        name={icon}
        size={14}
        color={good ? colors.success : colors.primary}
        style={{ marginTop: 1 }}
      />
      <Text style={[styles.text, good ? styles.goodText : styles.neutralText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: colors.primarySoft,
    borderColor: '#C7DAFF',
  },
  good: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  text: {
    fontSize: typography.small,
    fontWeight: '700',
  },
  neutralText: {
    color: colors.text,
  },
  goodText: {
    color: colors.text,
  },
});

