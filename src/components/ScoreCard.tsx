import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import { Card } from './Card';

function scoreLabel(score: number) {
  if (score >= 80) return 'High growth potential';
  if (score >= 65) return 'Strong foundation';
  if (score >= 50) return 'Promising, needs focus';
  return 'Needs clarity + execution';
}

export function ScoreCard({
  score,
  confidence,
  caption,
}: {
  score: number;
  confidence: number;
  caption?: string;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="trophy-outline" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Marketing score</Text>
          <Text style={styles.title}>{scoreLabel(score)}</Text>
        </View>
        <Text style={styles.score}>{score}</Text>
      </View>

      <View style={styles.meters}>
        <Meter label="Score" value={score} tone="primary" />
        <Meter label="Confidence" value={confidence} tone="success" />
      </View>

      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </Card>
  );
}

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'primary' | 'success';
}) {
  const color = tone === 'success' ? colors.success : colors.primary;
  return (
    <View style={styles.meter}>
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7DAFF',
  },
  kicker: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    marginTop: 2,
    fontSize: typography.subtitle,
    fontWeight: '900',
    color: colors.text,
  },
  score: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  meters: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  meter: {},
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  meterLabel: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.text,
  },
  meterValue: {
    fontSize: typography.small,
    fontWeight: '800',
    color: colors.mutedText,
  },
  track: {
    height: 10,
    backgroundColor: '#EFE7DB',
    borderRadius: radii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: 10,
    borderRadius: radii.pill,
  },
  caption: {
    marginTop: spacing.md,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.45,
  },
});

