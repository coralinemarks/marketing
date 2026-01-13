export type Role = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
};

export type MarketingAnswers = {
  companyName: string;
  productOrService: string;
  targetAudience: string;
  channels: string;
  budget: string;
  goals: string;
};

export type MarketingQuestionKey = Exclude<
  keyof MarketingAnswers,
  'companyName' | 'productOrService'
>;

export type MarketingProjectionPoint = {
  label: string; // e.g. "M1"
  value: number; // 0..100
};

export type MarketingInsights = {
  score: number; // 0..100
  projection: MarketingProjectionPoint[];
  tips: string[];
};

