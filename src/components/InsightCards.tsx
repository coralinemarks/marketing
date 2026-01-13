import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { InsightCard } from '../types/intelligence';

function toneIcon(tone: InsightCard['tone']): keyof typeof Ionicons.glyphMap {
  switch (tone) {
    case 'good':
      return 'checkmark-circle-outline';
    case 'warn':
      return 'warning-outline';
    default:
      return 'sparkles-outline';
  }
}

function toneColor(tone: InsightCard['tone']) {
  switch (tone) {
    case 'good':
      return colors.success;
    case 'warn':
      return '#D97706';
    default:
      return colors.primary;
  }
}

export function InsightCards({ cards }: { cards: InsightCard[] }) {
  if (!cards.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No insights yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {cards.map((c) => {
        const cColor = toneColor(c.tone);
        return (
          <View key={c.id} style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: `${cColor}18`, borderColor: `${cColor}55` }]}>
                <Ionicons name={toneIcon(c.tone)} size={18} color={cColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{c.title}</Text>
                <Text style={styles.impact}>{c.impact}</Text>
              </View>
            </View>

            <Text style={styles.body}>{c.body}</Text>

            <View style={styles.actionRow}>
              <Ionicons name="arrow-forward-outline" size={16} color={colors.mutedText} />
              <Text style={styles.action}>{c.action}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '900',
    color: colors.text,
  },
  impact: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '700',
  },
  body: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.body * 1.45,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.45,
    fontWeight: '700',
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
    fontWeight: '700',
  },
});

