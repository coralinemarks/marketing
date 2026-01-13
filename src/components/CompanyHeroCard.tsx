import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { Industry, MarketModel } from '../types/intelligence';

function industryLabel(i: Industry) {
  switch (i) {
    case 'SaaS':
      return 'SaaS';
    case 'Ecommerce':
      return 'E-commerce';
    case 'LocalServices':
      return 'Local services';
    case 'Education':
      return 'Education';
    case 'Healthcare':
      return 'Healthcare';
    default:
      return 'Other';
  }
}

export function CompanyHeroCard({
  companyName,
  productOrService,
  industry,
  model,
}: {
  companyName: string;
  productOrService: string;
  industry: Industry;
  model: MarketModel;
}) {
  return (
    <LinearGradient
      colors={['#EEF2FF', '#ECFDF5', '#FBF7F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={styles.badge}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{companyName || 'Your company'}</Text>
          <Text style={styles.subtitle}>{productOrService || 'Product / service'}</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag icon="pricetag-outline" label={industryLabel(industry)} />
        <Tag icon="swap-horizontal-outline" label={model} />
      </View>
    </LinearGradient>
  );
}

function Tag({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={14} color={colors.text} />
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: typography.body,
    color: colors.mutedText,
    lineHeight: typography.body * 1.35,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
  },
  tagText: {
    fontSize: typography.small,
    fontWeight: '800',
    color: colors.text,
  },
});

