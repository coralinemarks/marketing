import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import { Card } from './Card';
import { formatBudget } from '../utils/marketingInsights';
import type { ScenarioConfig } from '../types/scenario';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ScenarioCard({
  enabled,
  baseBudgetValue,
  scenario,
  onChange,
  onReset,
}: {
  enabled: boolean;
  baseBudgetValue: number | null;
  scenario: ScenarioConfig;
  onChange: (next: ScenarioConfig) => void;
  onReset: () => void;
}) {
  const effectiveBudget = useMemo(() => {
    const base = baseBudgetValue ?? 0;
    return Math.max(0, base + scenario.budgetDelta);
  }, [baseBudgetValue, scenario.budgetDelta]);

  const step = 250;

  return (
    <Card style={[styles.card, !enabled ? styles.cardDisabled : null]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="flask-outline" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>What‑if mode</Text>
          <Text style={styles.subtitle}>
            Try tweaks and see your score, chart, and tips update in real time.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onReset}
          disabled={!enabled}
          style={({ pressed }) => [styles.reset, pressed && enabled ? styles.resetPressed : null]}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      {!enabled ? (
        <Text style={styles.lockedText}>Finish the chat to unlock scenarios.</Text>
      ) : (
        <View style={styles.controls}>
          <View style={styles.row}>
            <Text style={styles.label}>Budget</Text>
            <Text style={styles.value}>{formatBudget(effectiveBudget)}</Text>
          </View>

          <View style={styles.stepper}>
            <StepButton
              icon="remove"
              onPress={() => onChange({ ...scenario, budgetDelta: clamp(scenario.budgetDelta - step, -5000, 15000) })}
            />
            <Text style={styles.delta}>
              {scenario.budgetDelta === 0 ? 'no change' : `${scenario.budgetDelta > 0 ? '+' : ''}$${scenario.budgetDelta}/mo`}
            </Text>
            <StepButton
              icon="add"
              onPress={() => onChange({ ...scenario, budgetDelta: clamp(scenario.budgetDelta + step, -5000, 15000) })}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Add a channel</Text>
            <TextInput
              value={scenario.addChannel}
              onChangeText={(t) => onChange({ ...scenario, addChannel: t })}
              placeholder="e.g., SEO"
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
        </View>
      )}
    </Card>
  );
}

function StepButton({
  icon,
  onPress,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.stepBtn, pressed ? styles.stepBtnPressed : null]}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  cardDisabled: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
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
  title: {
    fontSize: typography.subtitle,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.45,
  },
  reset: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  resetPressed: {
    opacity: 0.85,
  },
  resetText: {
    fontSize: typography.small,
    fontWeight: '800',
    color: colors.text,
  },
  lockedText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.mutedText,
    lineHeight: typography.body * 1.45,
  },
  controls: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '900',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPressed: {
    opacity: 0.85,
  },
  delta: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.body,
    fontWeight: '800',
    color: colors.text,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: typography.body,
  },
});

