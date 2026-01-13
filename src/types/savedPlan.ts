import type { MarketingAnswers, MarketingInsights } from './marketing';
import type { ScenarioConfig } from './scenario';

export type SavedPlan = {
  id: string;
  createdAt: number;
  title: string;
  answers: MarketingAnswers;
  scenario: ScenarioConfig;
  insights: MarketingInsights;
};

