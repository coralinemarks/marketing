export type Industry =
  | 'SaaS'
  | 'Ecommerce'
  | 'LocalServices'
  | 'Education'
  | 'Healthcare'
  | 'Other';

export type MarketModel = 'B2B' | 'B2C';

export type BudgetAllocation = {
  paidAds: number; // %
  social: number; // %
  email: number; // %
  content: number; // %
};

export type IntelligenceInputs = {
  companyName: string;
  productOrService: string;
  industry: Industry;
  model: MarketModel;
  /**
   * Monthly marketing budget (USD).
   */
  monthlyBudget: number;
  /**
   * Channel allocation must sum to 100.
   */
  allocation: BudgetAllocation;
  /**
   * Scenario dial: +/- growth rate adjustment in percentage points (YoY).
   */
  growthRateDeltaPct: number;
};

export type MarketSizing = {
  tamAnnualUsd: number;
  samAnnualUsd: number;
  growthRateYoYPct: number;
};

export type ForecastPoint = {
  label: string; // "M1"
  revenueUsd: number;
  profitUsd: number;
  customers: number;
  note?: string;
};

export type ProfitForecast = {
  annualSpendUsd: number;
  annualRevenueUsd: number;
  annualProfitUsd: number;
  roiPct: number;
  confidencePct: number;
  impliedMarketSharePct: number;
  assumptions: string[];
  projection: ForecastPoint[];
};

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  impact: string; // e.g. "+12% revenue"
  action: string;
  tone: 'good' | 'warn' | 'info';
};

