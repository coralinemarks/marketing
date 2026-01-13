import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

export function TipsList({ tips }: { tips: string[] }) {
  if (!tips.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No tips yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {tips.map((t, idx) => (
        <View key={`${idx}_${t.slice(0, 16)}`} style={styles.item}>
          <Text style={styles.bullet}>{idx + 1}.</Text>
          <Text style={styles.text}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  bullet: {
    width: 18,
    fontSize: typography.body,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: typography.body,
    lineHeight: typography.body * 1.45,
    color: colors.text,
  },
  empty: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
  },
  emptyText: {
    fontSize: typography.small,
    color: colors.mutedText,
  },
});

