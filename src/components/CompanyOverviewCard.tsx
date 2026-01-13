import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import { Card } from './Card';

export function CompanyOverviewCard({
  companyName,
  productOrService,
}: {
  companyName?: string;
  productOrService?: string;
}) {
  const hasAny = Boolean(companyName?.trim() || productOrService?.trim());
  if (!hasAny) return null;

  return (
    <Card style={styles.card}>
      <Text style={styles.kicker}>Company overview</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Company</Text>
        <Text style={styles.value}>{companyName?.trim() || '—'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Product / service</Text>
        <Text style={styles.value}>{productOrService?.trim() || '—'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    marginTop: spacing.sm,
  },
  label: {
    fontSize: typography.small,
    color: colors.mutedText,
  },
  value: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});

