import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import { Card } from './Card';
import type { SavedPlan } from '../types/savedPlan';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SavedPlansCard({
  plans,
  onLoad,
  onDelete,
}: {
  plans: SavedPlan[];
  onLoad: (plan: SavedPlan) => void;
  onDelete: (plan: SavedPlan) => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="bookmark-outline" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Saved plans</Text>
          <Text style={styles.subtitle}>Save a plan to compare scenarios later.</Text>
        </View>
      </View>

      {!plans.length ? (
        <Text style={styles.empty}>No saved plans yet.</Text>
      ) : (
        <View style={styles.list}>
          {plans.map((p) => (
            <View key={p.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{p.title}</Text>
                <Text style={styles.meta}>
                  {formatDate(p.createdAt)} • score {p.insights.score}/100
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => onLoad(p)}
                style={({ pressed }) => [styles.btn, pressed ? styles.btnPressed : null]}
              >
                <Text style={styles.btnText}>Load</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert('Delete saved plan?', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDelete(p) },
                  ])
                }
                style={({ pressed }) => [styles.iconBtn, pressed ? styles.btnPressed : null]}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  empty: {
    fontSize: typography.body,
    color: colors.mutedText,
    lineHeight: typography.body * 1.45,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  itemTitle: {
    fontSize: typography.body,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: typography.small,
    color: colors.mutedText,
  },
  btn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  iconBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    fontSize: typography.small,
    fontWeight: '900',
    color: colors.text,
  },
});

