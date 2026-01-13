import type { MarketingAnswers, MarketingInsights, MarketingProjectionPoint } from '../types/marketing';
import { hashToSeed, mulberry32 } from './seededRandom';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseBudgetValue(budgetRaw: string) {
  // Accept inputs like "500", "$500", "500/mo", "2k", "2000 per month"
  const s = budgetRaw.trim().toLowerCase();
  const match = s.match(/([\d,.]+)\s*(k)?/);
  if (!match) return null;
  const num = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(num)) return null;
  return match[2] ? num * 1000 : num;
}

function channelCount(channelsRaw: string) {
  const parts = channelsRaw
    .split(/[,\n]/g)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length;
}

function looksSpecific(text: string) {
  // Very lightweight heuristic: longer + contains concrete qualifiers.
  const t = text.toLowerCase();
  const hasQualifier =
    /(age|years?|parents?|students?|b2b|b2c|saas|enterprise|local|region|industry|title|role|income|budget|company size)/.test(
      t
    );
  return text.trim().length >= 25 || hasQualifier;
}

function looksSmartGoals(text: string) {
  // Tiny heuristic: numbers/timeframes/metrics suggest SMART.
  const t = text.toLowerCase();
  return /(\b\d+\b)|(%|kpi|metric|mrr|arr|leads?|signups?|revenue|weeks?|months?|by\s+\w+)/.test(t);
}

function buildTips(a: MarketingAnswers, score: number) {
  const tips: string[] = [];

  if (!looksSpecific(a.targetAudience)) {
    tips.push(
      'Tighten your target audience: add role/title, industry, location, budget, and a primary pain point so your messaging can be sharper.'
    );
  }

  const cc = channelCount(a.channels);
  if (cc <= 1) {
    tips.push(
      'Diversify channels: pair one “demand capture” channel (search, outbound) with one “demand creation” channel (content, social) to reduce risk.'
    );
  } else if (cc >= 4) {
    tips.push(
      'Focus your channels: pick 2–3 channels to run consistently for 6–8 weeks before expanding, so you can learn and iterate faster.'
    );
  } else {
    tips.push(
      'Create a simple channel plan: define an experiment per channel (hypothesis, weekly output, KPI) and review results every 2 weeks.'
    );
  }

  const budget = parseBudgetValue(a.budget);
  if (!budget || budget < 300) {
    tips.push(
      'If budget is limited, prioritize high-leverage efforts: clear positioning, landing page optimization, and 1–2 repeatable acquisition loops.'
    );
  } else if (budget >= 3000) {
    tips.push(
      'With a larger budget, reserve 10–20% for experiments (new creatives, new audience segments) and scale only what hits your KPI targets.'
    );
  } else {
    tips.push(
      'Allocate budget intentionally: split into “always-on” (baseline performance) and “experiments” (learning) so you keep momentum while improving.'
    );
  }

  if (!looksSmartGoals(a.goals)) {
    tips.push(
      'Make goals measurable: pick 1–2 primary KPIs (e.g., qualified leads/week, trials/month), set a baseline, and add a deadline.'
    );
  } else {
    tips.push(
      'Connect goals to a funnel: define top-of-funnel input metrics (traffic, CTR) and mid-funnel metrics (CVR, CAC) so you can diagnose issues quickly.'
    );
  }

  tips.push(
    'Build a weekly cadence: publish/ship on set days, review metrics on Fridays, and decide one concrete improvement for the next week.'
  );
  tips.push(
    'Instrument tracking early: ensure analytics events, UTMs, and a simple dashboard exist before scaling spend so you can attribute results.'
  );

  if (score < 55) {
    tips.push(
      'Start with quick wins: improve your offer clarity, add social proof, and run small A/B tests on your headline and call-to-action.'
    );
  } else if (score > 75) {
    tips.push(
      'Codify what works: document your best-performing messages, audiences, and creatives so execution is consistent as you scale.'
    );
  }

  // Keep it short and actionable.
  return tips.slice(0, 8);
}

function generateProjection(score: number, seedKey: string): MarketingProjectionPoint[] {
  const seed = hashToSeed(seedKey);
  const rand = mulberry32(seed);

  const months = 12;
  const start = clamp(score * 0.45, 10, 60);
  const end = clamp(score + 10, 25, 95);
  const k = clamp(0.25 + score / 400, 0.25, 0.55); // growth rate

  const points: MarketingProjectionPoint[] = [];
  for (let i = 1; i <= months; i++) {
    const t = i / months;
    // Logistic-ish curve.
    const base = start + (end - start) * (1 / (1 + Math.exp(-10 * k * (t - 0.5))));
    const noise = (rand() - 0.5) * 6; // subtle variance
    const v = clamp(base + noise, 0, 100);
    points.push({ label: `M${i}`, value: Math.round(v) });
  }
  return points;
}

/**
 * Pure function that turns answers into a projection + actionable tips.
 * Wrapped by UI with loading/error states.
 */
export function generateMarketingInsights(answers: MarketingAnswers): MarketingInsights {
  const budget = parseBudgetValue(answers.budget);
  const channels = channelCount(answers.channels);

  let score = 40;

  // Audience
  score += looksSpecific(answers.targetAudience) ? 12 : -6;

  // Channels
  if (channels === 0) score -= 10;
  else if (channels === 1) score -= 4;
  else if (channels === 2) score += 8;
  else if (channels === 3) score += 10;
  else score += 6;

  // Budget (very rough; marketing is context-dependent)
  if (budget == null) score -= 2;
  else if (budget < 300) score -= 6;
  else if (budget < 1500) score += 6;
  else if (budget < 4000) score += 10;
  else score += 12;

  // Goals
  score += looksSmartGoals(answers.goals) ? 10 : -4;

  score = clamp(Math.round(score), 0, 100);

  const seedKey = [
    answers.companyName,
    answers.productOrService,
    answers.targetAudience,
    answers.channels,
    answers.budget,
    answers.goals,
  ].join('|');

  const projection = generateProjection(score, seedKey);
  const tips = buildTips(answers, score);

  return { score, projection, tips };
}

