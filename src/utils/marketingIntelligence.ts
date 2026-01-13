import type {
  BudgetAllocation,
  ForecastPoint,
  Industry,
  InsightCard,
  IntelligenceInputs,
  MarketModel,
  MarketSizing,
  ProfitForecast,
} from '../types/intelligence';
import { hashToSeed, mulberry32 } from './seededRandom';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number) {
  return Math.round(n);
}

export function formatMoneyCompact(usd: number) {
  const abs = Math.abs(usd);
  const sign = usd < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${sign}$${round(abs)}`;
}

export function allocationSum(a: BudgetAllocation) {
  return a.paidAds + a.social + a.email + a.content;
}

export function normalizeAllocation(a: BudgetAllocation): BudgetAllocation {
  const sum = allocationSum(a);
  if (sum <= 0) {
    return { paidAds: 40, social: 25, email: 15, content: 20 };
  }
  // Normalize to 100 with rounding and deterministic remainder distribution.
  const raw = {
    paidAds: (a.paidAds / sum) * 100,
    social: (a.social / sum) * 100,
    email: (a.email / sum) * 100,
    content: (a.content / sum) * 100,
  };
  const floored = {
    paidAds: Math.floor(raw.paidAds),
    social: Math.floor(raw.social),
    email: Math.floor(raw.email),
    content: Math.floor(raw.content),
  };
  let remainder = 100 - allocationSum(floored);
  const fracs = (
    [
      ['paidAds', raw.paidAds - floored.paidAds],
      ['social', raw.social - floored.social],
      ['email', raw.email - floored.email],
      ['content', raw.content - floored.content],
    ] as Array<[keyof BudgetAllocation, number]>
  ).sort((a1, a2) => a2[1] - a1[1]);

  const out: BudgetAllocation = { ...floored };
  let i = 0;
  while (remainder > 0) {
    const k = fracs[i % fracs.length][0];
    out[k] += 1;
    remainder -= 1;
    i += 1;
  }
  return out;
}

export function setAllocationChannel(
  current: BudgetAllocation,
  key: keyof BudgetAllocation,
  nextValue: number
): BudgetAllocation {
  const v = clamp(round(nextValue), 0, 100);
  const otherKeys = (['paidAds', 'social', 'email', 'content'] as const).filter((k) => k !== key);

  const curValue = current[key];
  const delta = v - curValue;
  const othersTotal = otherKeys.reduce((s, k) => s + current[k], 0);

  // If others are 0 and we increase this channel, pull from it by shrinking itself back.
  if (othersTotal === 0 && delta > 0) {
    const out = { ...current, [key]: clamp(100, 0, 100) } as BudgetAllocation;
    return normalizeAllocation(out);
  }

  // Redistribute delta across others proportionally.
  const out: BudgetAllocation = { ...current, [key]: v } as BudgetAllocation;
  if (delta !== 0) {
    otherKeys.forEach((k) => {
      const share = othersTotal > 0 ? current[k] / othersTotal : 1 / otherKeys.length;
      out[k] = clamp(round(current[k] - delta * share), 0, 100);
    });
  }
  return normalizeAllocation(out);
}

export function inferModelFromText(text: string): MarketModel {
  const t = text.toLowerCase();
  if (t.includes('b2b') || t.includes('enterprise') || t.includes('saas') || t.includes('teams')) return 'B2B';
  if (t.includes('b2c') || t.includes('consumers') || t.includes('parents') || t.includes('students')) return 'B2C';
  return 'B2C';
}

export function inferIndustryFromText(text: string): Industry {
  const t = text.toLowerCase();
  if (t.includes('saas') || t.includes('software')) return 'SaaS';
  if (t.includes('ecommerce') || t.includes('shop') || t.includes('store') || t.includes('d2c')) return 'Ecommerce';
  if (t.includes('clinic') || t.includes('health') || t.includes('medical')) return 'Healthcare';
  if (t.includes('course') || t.includes('education') || t.includes('students')) return 'Education';
  if (t.includes('local') || t.includes('plumbing') || t.includes('roof') || t.includes('dentist')) return 'LocalServices';
  return 'Other';
}

type IndustryBaseline = {
  tamAnnualUsd: number;
  growthRateYoYPct: number;
  grossMarginPct: number;
  revenuePerCustomerAnnualUsd: number;
};

const BASELINES: Record<Industry, IndustryBaseline> = {
  SaaS: { tamAnnualUsd: 8_000_000_000, growthRateYoYPct: 18, grossMarginPct: 78, revenuePerCustomerAnnualUsd: 2400 },
  Ecommerce: { tamAnnualUsd: 2_500_000_000, growthRateYoYPct: 10, grossMarginPct: 45, revenuePerCustomerAnnualUsd: 180 },
  LocalServices: { tamAnnualUsd: 900_000_000, growthRateYoYPct: 7, grossMarginPct: 55, revenuePerCustomerAnnualUsd: 450 },
  Education: { tamAnnualUsd: 1_200_000_000, growthRateYoYPct: 9, grossMarginPct: 60, revenuePerCustomerAnnualUsd: 300 },
  Healthcare: { tamAnnualUsd: 3_000_000_000, growthRateYoYPct: 8, grossMarginPct: 58, revenuePerCustomerAnnualUsd: 600 },
  Other: { tamAnnualUsd: 1_000_000_000, growthRateYoYPct: 8, grossMarginPct: 55, revenuePerCustomerAnnualUsd: 400 },
};

export function calculateMarketSizing(input: IntelligenceInputs, audienceSpecificityScore: number): MarketSizing {
  const base = BASELINES[input.industry];
  // SAM is the portion you can realistically reach: influenced by specificity + budget scale.
  const specificityFactor = clamp(0.7 + audienceSpecificityScore * 0.6, 0.6, 1.25);

  // Budget scale: more budget generally enables broader reach, but with diminishing returns.
  const annualSpend = input.monthlyBudget * 12;
  const spendFactor = clamp(Math.log10(Math.max(10_000, annualSpend)) / 5, 0.6, 1.2);

  const tam = base.tamAnnualUsd;
  const sam = clamp(tam * 0.12 * specificityFactor * spendFactor, tam * 0.02, tam * 0.5);

  const growth = clamp(base.growthRateYoYPct + input.growthRateDeltaPct, -5, 40);
  return { tamAnnualUsd: tam, samAnnualUsd: sam, growthRateYoYPct: growth };
}

export function estimateBlendedCAC(allocation: BudgetAllocation, model: MarketModel, audienceSpecificityScore: number) {
  // Deterministic, explainable CAC assumptions by channel.
  // (B2B tends to have higher CAC; specificity reduces CAC.)
  const b2bMult = model === 'B2B' ? 1.25 : 1.0;
  const specificityMult = clamp(1.15 - audienceSpecificityScore * 0.25, 0.85, 1.15);

  const channelCAC: Record<keyof BudgetAllocation, number> = {
    paidAds: 120,
    social: 80,
    email: 35,
    content: 60,
  };

  const weights: Record<keyof BudgetAllocation, number> = {
    paidAds: allocation.paidAds / 100,
    social: allocation.social / 100,
    email: allocation.email / 100,
    content: allocation.content / 100,
  };

  const blended =
    channelCAC.paidAds * weights.paidAds +
    channelCAC.social * weights.social +
    channelCAC.email * weights.email +
    channelCAC.content * weights.content;

  return clamp(blended * b2bMult * specificityMult, 25, 450);
}

export function estimateConfidence({
  score,
  marketGrowthYoY,
  allocation,
}: {
  score: number;
  marketGrowthYoY: number;
  allocation: BudgetAllocation;
}) {
  // Confidence proxy: execution score + diversification + market tailwind.
  const mix = [allocation.paidAds, allocation.social, allocation.email, allocation.content]
    .map((p) => (p <= 0 ? 0 : 1))
    .reduce((a: number, b: number) => a + b, 0);
  const diversity = clamp((mix / 4) * 12, 0, 12);
  const tailwind = clamp((marketGrowthYoY - 5) * 0.35, -6, 10);
  return clamp(round(40 + score * 0.45 + diversity + tailwind), 30, 92);
}

export function calculateProfitForecast(params: {
  input: IntelligenceInputs;
  marketingScore: number;
  audienceSpecificityScore: number; // 0..1
}): { market: MarketSizing; forecast: ProfitForecast } {
  const { input, marketingScore, audienceSpecificityScore } = params;
  const base = BASELINES[input.industry];
  const market = calculateMarketSizing(input, audienceSpecificityScore);

  const annualSpendUsd = input.monthlyBudget * 12;
  const blendedCAC = estimateBlendedCAC(input.allocation, input.model, audienceSpecificityScore);

  // Efficiency: score + mix slightly improves conversion from spend to customers.
  const efficiency = clamp(0.85 + marketingScore / 400 + audienceSpecificityScore * 0.25, 0.75, 1.25);
  const customersAnnual = Math.max(0, Math.floor((annualSpendUsd / blendedCAC) * efficiency));

  // Revenue per customer derived from industry baseline; B2B tends higher contract values.
  const modelMult = input.model === 'B2B' ? 1.35 : 1.0;
  const revenuePerCustomerAnnualUsd = base.revenuePerCustomerAnnualUsd * modelMult;
  const annualRevenueUsd = customersAnnual * revenuePerCustomerAnnualUsd;

  // Gross profit - marketing spend
  const grossMarginPct = base.grossMarginPct;
  const annualProfitUsd = annualRevenueUsd * (grossMarginPct / 100) - annualSpendUsd;
  const roiPct = annualSpendUsd <= 0 ? 0 : (annualProfitUsd / annualSpendUsd) * 100;

  // Market share (within SAM), clamped
  const impliedShare = market.samAnnualUsd <= 0 ? 0 : (annualRevenueUsd / market.samAnnualUsd) * 100;
  const impliedMarketSharePct = clamp(impliedShare, 0, 25);

  const confidencePct = estimateConfidence({
    score: marketingScore,
    marketGrowthYoY: market.growthRateYoYPct,
    allocation: input.allocation,
  });

  const assumptions = [
    `Blended CAC is estimated from channel mix (paid ads/social/email/content) and adjusted for B2B/B2C + audience clarity.`,
    `Revenue per customer uses an industry baseline and a B2B multiplier.`,
    `Profit = (Revenue × gross margin) − marketing spend.`,
    `Market share is estimated as Revenue ÷ SAM (serviceable available market).`,
  ];

  const projection = buildProjection({
    seedKey: `${input.companyName}|${input.productOrService}|${input.industry}|${input.model}|${input.monthlyBudget}|${JSON.stringify(input.allocation)}|${input.growthRateDeltaPct}`,
    months: 12,
    annualSpendUsd,
    annualRevenueUsd,
    annualProfitUsd,
    customersAnnual,
    growthYoY: market.growthRateYoYPct,
  });

  return {
    market,
    forecast: {
      annualSpendUsd,
      annualRevenueUsd,
      annualProfitUsd,
      roiPct,
      confidencePct,
      impliedMarketSharePct,
      assumptions,
      projection,
    },
  };
}

function buildProjection(params: {
  seedKey: string;
  months: number;
  annualSpendUsd: number;
  annualRevenueUsd: number;
  annualProfitUsd: number;
  customersAnnual: number;
  growthYoY: number;
}): ForecastPoint[] {
  const rand = mulberry32(hashToSeed(params.seedKey));
  const m = params.months;
  const revenueMonthlyBase = params.annualRevenueUsd / 12;
  const profitMonthlyBase = params.annualProfitUsd / 12;
  const customersMonthlyBase = params.customersAnnual / 12;

  // Convert YoY growth into a rough monthly factor.
  const monthlyGrowth = Math.pow(1 + clamp(params.growthYoY, -5, 40) / 100, 1 / 12) - 1;

  const points: ForecastPoint[] = [];
  for (let i = 1; i <= m; i++) {
    // Ramp in first 3 months; then compound.
    const ramp = clamp(i / 3, 0.35, 1);
    const compound = Math.pow(1 + monthlyGrowth, i - 1);
    const noise = (rand() - 0.5) * 0.08; // +/-4%
    const factor = ramp * compound * (1 + noise);

    points.push({
      label: `M${i}`,
      revenueUsd: Math.max(0, revenueMonthlyBase * factor),
      profitUsd: profitMonthlyBase * factor,
      customers: Math.max(0, Math.round(customersMonthlyBase * factor)),
    });
  }

  if (points.length >= 12) {
    points[1].note = 'Launch + first experiments';
    points[Math.floor(points.length / 2)].note = 'Compounding iteration';
    points[points.length - 2].note = 'Scaling winners';
  }

  return points;
}

export function generateInsightCards(params: {
  input: IntelligenceInputs;
  market: MarketSizing;
  forecast: ProfitForecast;
}): InsightCard[] {
  const { input, market, forecast } = params;
  const cards: InsightCard[] = [];

  const content = input.allocation.content;
  const paid = input.allocation.paidAds;
  const email = input.allocation.email;

  if (paid >= 60) {
    cards.push({
      id: 'paid_overweight',
      title: 'You’re leaning heavily on paid acquisition',
      body: 'Paid can scale fast, but it’s vulnerable to CAC increases. Add a non-paid growth loop to stabilize performance.',
      impact: 'Higher confidence',
      action: 'Shift 10–15% into content or email and measure CAC + retention weekly.',
      tone: 'warn',
    });
  }

  if (content < 15 && market.growthRateYoYPct >= 12) {
    cards.push({
      id: 'content_undervalue',
      title: 'Under-investing in a high-growth market',
      body: 'In expanding markets, consistent content compounds: lower CAC over time and builds defensibility.',
      impact: '+5–12% revenue over 12 months',
      action: 'Move 10% from paid/social into content; ship 2 pieces/week for 8 weeks.',
      tone: 'info',
    });
  }

  if (email < 10) {
    cards.push({
      id: 'email_gap',
      title: 'Email is a cheap conversion lever',
      body: 'Even small email investment improves conversion and retention, which makes every channel more profitable.',
      impact: '+3–8% ROI',
      action: 'Set up a welcome + nurture sequence and capture emails on your primary landing page.',
      tone: 'info',
    });
  }

  if (forecast.impliedMarketSharePct > 2) {
    cards.push({
      id: 'share_strong',
      title: 'This plan can capture meaningful share',
      body: `Based on your inputs, the forecast implies ~${forecast.impliedMarketSharePct.toFixed(1)}% of SAM. That’s big enough to matter.`,
      impact: 'Strong upside',
      action: 'Double down on tracking + creative testing so you can scale what works.',
      tone: 'good',
    });
  }

  if (forecast.annualProfitUsd < 0) {
    cards.push({
      id: 'profit_risk',
      title: 'Profit risk: spend may outpace margin',
      body: 'Your forecast shows marketing spend consuming most of gross profit. Reduce CAC or improve conversion before scaling.',
      impact: 'Avoid negative ROI',
      action: 'Tighten audience + improve offer/landing page; target a 15–25% CAC reduction.',
      tone: 'warn',
    });
  }

  // Keep it tight.
  return cards.slice(0, 5);
}

