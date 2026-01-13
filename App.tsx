import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatBubble } from './src/components/ChatBubble';
import { ChatComposer } from './src/components/ChatComposer';
import { CompanyOverviewCard } from './src/components/CompanyOverviewCard';
import { Card } from './src/components/Card';
import { LineChart } from './src/components/LineChart';
import { SectionHeader } from './src/components/SectionHeader';
import { TipsList } from './src/components/TipsList';
import { TypingIndicator } from './src/components/TypingIndicator';
import { colors, radii, spacing, typography } from './src/constants/theme';
import type { ChatMessage, MarketingAnswers, MarketingInsights } from './src/types/marketing';
import { makeId } from './src/utils/id';
import {
  applyScenarioToAnswers,
  calculateConfidence,
  calculateMarketingScore,
  channelCount,
  generateMarketingInsights,
  looksSmartGoals,
  looksSpecific,
  parseBudgetValue,
} from './src/utils/marketingInsights';
import { BadgeChip } from './src/components/BadgeChip';
import { ScoreCard } from './src/components/ScoreCard';
import { ScenarioCard } from './src/components/ScenarioCard';
import type { ScenarioConfig } from './src/types/scenario';
import type { SavedPlan } from './src/types/savedPlan';
import * as Clipboard from 'expo-clipboard';
import { addSavedPlan, deleteSavedPlan, loadSavedPlans } from './src/services/storage';
import { SavedPlansCard } from './src/components/SavedPlansCard';

export default function App() {
  const COACH_NAME = 'Marketing Coach';

  const QUESTIONS: Array<{
    key: keyof MarketingAnswers;
    prompt: string;
    placeholder: string;
  }> = useMemo(
    () => [
      {
        key: 'companyName',
        prompt: `Hey! I’m your ${COACH_NAME}.\n\nLet’s turn your plan into something you can actually execute.\n\nFirst up: what’s your company name?`,
        placeholder: 'Company name',
      },
      {
        key: 'productOrService',
        prompt: `Nice. What product or service do you sell?`,
        placeholder: 'e.g., meal kit delivery for busy families',
      },
      {
        key: 'targetAudience',
        prompt: `Who exactly are we trying to win?\n\nGive me the audience (role/title, industry, location, pain point).`,
        placeholder: 'e.g., founders of small SaaS companies in the US',
      },
      {
        key: 'channels',
        prompt: `Where will people discover you?\n\nList the channels you’ll use (comma-separated).`,
        placeholder: 'e.g., SEO, Instagram, partnerships, email',
      },
      {
        key: 'budget',
        prompt: `Alright—what’s the monthly marketing budget?\n\nRough is fine.`,
        placeholder: 'e.g., $500/month',
      },
      {
        key: 'goals',
        prompt: `Last one: what’s the goal for the next 3 months?\n\nBonus points for a metric + deadline.`,
        placeholder: 'e.g., 200 trial signups by end of March',
      },
    ],
    []
  );

  const scrollRef = useRef<ScrollView | null>(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<MarketingAnswers>({
    companyName: '',
    productOrService: '',
    targetAudience: '',
    channels: '',
    budget: '',
    goals: '',
  });

  const [insightsState, setInsightsState] = useState<
    | { status: 'locked' }
    | { status: 'loading' }
    | { status: 'ready'; data: MarketingInsights }
    | { status: 'error'; message: string }
  >({ status: 'locked' });

  const isComplete = questionIndex >= QUESTIONS.length;
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const liveScore = useMemo(() => calculateMarketingScore(answers), [answers]);
  const liveConfidence = useMemo(() => calculateConfidence(liveScore), [liveScore]);
  const [scenario, setScenario] = useState<ScenarioConfig>({ budgetDelta: 0, addChannel: '' });
  const baseBudgetValue = useMemo(() => parseBudgetValue(answers.budget), [answers.budget]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const startConversation = useCallback(() => {
    setQuestionIndex(0);
    setAnswers({
      companyName: '',
      productOrService: '',
      targetAudience: '',
      channels: '',
      budget: '',
      goals: '',
    });
    setInsightsState({ status: 'locked' });
    setIsCoachTyping(false);
    setScenario({ budgetDelta: 0, addChannel: '' });
    setMessages([
      {
        id: makeId('msg'),
        role: 'assistant',
        text: QUESTIONS[0].prompt,
        createdAt: Date.now(),
        kind: 'message',
      },
    ]);
  }, [QUESTIONS]);

  useEffect(() => {
    // Initialize the first assistant message once.
    startConversation();
  }, [startConversation]);

  useEffect(() => {
    // Load saved plans once on mount (AsyncStorage works on web too).
    loadSavedPlans()
      .then(setSavedPlans)
      .catch(() => setSavedPlans([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!isComplete) return;

    // Generate insights once the chat questions are complete.
    setInsightsState({ status: 'loading' });
    const t = setTimeout(() => {
      try {
        const data = generateMarketingInsights(answers);
        setInsightsState({ status: 'ready', data });
      } catch (e) {
        setInsightsState({
          status: 'error',
          message: e instanceof Error ? e.message : 'Something went wrong while analyzing your plan.',
        });
      }
    }, 900);

    return () => clearTimeout(t);
  }, [answers, isComplete]);

  const current = QUESTIONS[questionIndex];

  const progress = useMemo(() => {
    const total = QUESTIONS.length;
    const answered = Math.min(questionIndex, total);
    return { total, answered, pct: total === 0 ? 0 : answered / total };
  }, [QUESTIONS.length, questionIndex]);

  const badges = useMemo(() => {
    const list: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; tone: 'neutral' | 'good' }> = [];
    if (answers.targetAudience.trim().length > 0 && looksSpecific(answers.targetAudience)) {
      list.push({ icon: 'people-outline', label: 'Clear target audience', tone: 'good' });
    }
    const c = channelCount(answers.channels);
    if (answers.channels.trim().length > 0 && c >= 2 && c <= 3) {
      list.push({ icon: 'megaphone-outline', label: 'Strong channel mix', tone: 'good' });
    }
    const b = parseBudgetValue(answers.budget);
    if (answers.budget.trim().length > 0 && b != null && b >= 1500) {
      list.push({ icon: 'cash-outline', label: 'Testing budget', tone: 'good' });
    }
    if (answers.goals.trim().length > 0 && looksSmartGoals(answers.goals)) {
      list.push({ icon: 'flag-outline', label: 'Measurable goals', tone: 'good' });
    }
    if (liveScore >= 75) {
      list.push({ icon: 'trending-up-outline', label: 'High growth potential', tone: 'good' });
    }
    return list.slice(0, 5);
  }, [answers.budget, answers.channels, answers.goals, answers.targetAudience, liveScore]);

  const makeCoachReaction = useCallback(
    (key: keyof MarketingAnswers, text: string) => {
      const t = text.trim();
      if (!t) return `I didn’t catch that—mind trying again?`;
      switch (key) {
        case 'companyName':
          return `Got it. ${t}—sounds like we’re building something real.`;
        case 'productOrService':
          return `Nice. I’m already thinking about positioning for “${t}”.`;
        case 'targetAudience':
          return t.length >= 25
            ? `Solid—specific audiences are easier to win.`
            : `Okay—let’s sharpen that later. Specificity = cheaper growth.`;
        case 'channels': {
          const c = t.split(/[,\n]/g).map((p) => p.trim()).filter(Boolean).length;
          if (c <= 1) return `One channel can work, but it’s fragile. We’ll add a backup lever.`;
          if (c >= 4) return `Ambitious mix—let’s focus so execution stays consistent.`;
          return `Good channel mix. Enough to learn, not too much to juggle.`;
        }
        case 'budget':
          return `Perfect—budget tells me how aggressive we can be with testing.`;
        case 'goals':
          return `Love it. Goals give us a scoreboard—now we can play to win.`;
        default:
          return `Noted.`;
      }
    },
    []
  );

  const composer = useMemo(() => {
    if (insightsState.status === 'loading') {
      return { placeholder: 'Analyzing…', disabled: true };
    }
    if (isComplete) {
      return { placeholder: 'Done! Tap “Start over” to run again.', disabled: true };
    }
    if (isCoachTyping) {
      return { placeholder: `${COACH_NAME} is thinking…`, disabled: true };
    }
    return { placeholder: current?.placeholder ?? 'Type your answer…', disabled: false };
  }, [COACH_NAME, current, insightsState.status, isComplete, isCoachTyping]);

  const onSend = useCallback(
    (text: string) => {
      if (!current) return;

      // Append the user's message.
      setMessages((m) => [
        ...m,
        { id: makeId('msg'), role: 'user', text, createdAt: Date.now(), kind: 'message' },
      ]);

      // Save answer.
      setAnswers((a) => ({ ...a, [current.key]: text }));

      setIsCoachTyping(true);

      const nextIndex = questionIndex + 1;
      const next = QUESTIONS[nextIndex];
      const reaction = makeCoachReaction(current.key, text);

      // Small delay to simulate a human-ish coach pacing.
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { id: makeId('msg'), role: 'assistant', text: reaction, createdAt: Date.now(), kind: 'message' },
        ]);

        setTimeout(() => {
          setIsCoachTyping(false);
          setQuestionIndex(nextIndex);
          setMessages((m) => [
            ...m,
            {
              id: makeId('msg'),
              role: 'assistant',
              text: next
                ? next.prompt
                : `Alright—strategy captured.\n\nScroll down for your score, projection, and the moves I’d make next.`,
              createdAt: Date.now(),
              kind: 'message',
            },
          ]);
        }, 350);
      }, 550);
    },
    [QUESTIONS, current, makeCoachReaction, questionIndex]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[colors.background, colors.background2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          ref={(r) => {
            scrollRef.current = r;
          }}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
              </View>
              <Text style={styles.title}>Marketing Coach</Text>
            </View>
            <Text style={styles.subtitle}>
              A playful, practical way to turn your inputs into a score, a timeline, and next steps.
            </Text>

            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress.pct * 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {progress.answered}/{progress.total} answered
              </Text>
            </View>
          </View>

          <CompanyOverviewCard
            companyName={answers.companyName}
            productOrService={answers.productOrService}
          />

          <ScoreCard
            score={liveScore}
            confidence={liveConfidence}
            caption="This score updates as you answer questions. It’s a directional signal—your execution is what makes it real."
          />

          {badges.length ? (
            <View style={styles.badgesRow}>
              {badges.map((b) => (
                <BadgeChip key={b.label} icon={b.icon} label={b.label} tone={b.tone} />
              ))}
            </View>
          ) : null}

          <Card style={styles.chatCard}>
            <Text style={styles.chatTitle}>Chat</Text>
            <View style={styles.chatTranscript}>
              {messages.map((m) =>
                m.kind === 'typing' ? (
                  <TypingIndicator key={m.id} label={`${COACH_NAME} is thinking`} />
                ) : (
                  <ChatBubble key={m.id} role={m.role} text={m.text} />
                )
              )}
              {isCoachTyping ? <TypingIndicator label="Analyzing your strategy" /> : null}
            </View>
          </Card>

          <View style={styles.results}>
            <SectionHeader
              title="Marketing success over time"
              subtitle="A simulated projection (0–100) based on your inputs. Use it as directional guidance—not a guarantee."
            />

            <ScenarioCard
              enabled={insightsState.status === 'ready'}
              baseBudgetValue={baseBudgetValue}
              scenario={scenario}
              onChange={setScenario}
              onReset={() => setScenario({ budgetDelta: 0, addChannel: '' })}
            />

            {insightsState.status === 'locked' ? (
              <Card>
                <Text style={styles.muted}>
                  Complete the chat questions to unlock your projection and tips.
                </Text>
              </Card>
            ) : insightsState.status === 'loading' ? (
              <Card style={styles.loadingCard}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Analyzing your marketing plan…</Text>
              </Card>
            ) : insightsState.status === 'error' ? (
              <Card>
                <Text style={styles.errorTitle}>We hit an issue</Text>
                <Text style={styles.errorText}>{insightsState.message}</Text>
              </Card>
            ) : (
              <>
                {(() => {
                  const scenarioAnswers = applyScenarioToAnswers(answers, scenario);
                  const scenarioInsights = generateMarketingInsights(scenarioAnswers);
                  return (
                    <>
                      <View style={styles.actionsRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={async () => {
                            const title = `${answers.companyName || 'Marketing plan'} — ${new Date().toLocaleDateString()}`;
                            const plan: SavedPlan = {
                              id: makeId('plan'),
                              createdAt: Date.now(),
                              title,
                              answers,
                              scenario,
                              insights: scenarioInsights,
                            };
                            const next = await addSavedPlan(plan);
                            setSavedPlans(next);
                            setToast('Saved plan');
                          }}
                          style={({ pressed }) => [styles.actionBtn, pressed ? styles.actionBtnPressed : null]}
                        >
                          <Ionicons name="bookmark-outline" size={16} color={colors.text} />
                          <Text style={styles.actionBtnText}>Save</Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          onPress={async () => {
                            const summary = [
                              `Marketing plan summary`,
                              `Company: ${answers.companyName || '—'}`,
                              `Product/service: ${answers.productOrService || '—'}`,
                              `Score: ${scenarioInsights.score}/100`,
                              `Confidence: ${calculateConfidence(scenarioInsights.score)}%`,
                              ``,
                              `Top tips:`,
                              ...scenarioInsights.tips.slice(0, 5).map((t, i) => `${i + 1}. ${t}`),
                            ].join('\n');
                            await Clipboard.setStringAsync(summary);
                            setToast('Copied summary');
                          }}
                          style={({ pressed }) => [styles.actionBtn, pressed ? styles.actionBtnPressed : null]}
                        >
                          <Ionicons name="share-outline" size={16} color={colors.text} />
                          <Text style={styles.actionBtnText}>Copy summary</Text>
                        </Pressable>
                      </View>

                      <ScoreCard
                        score={scenarioInsights.score}
                        confidence={calculateConfidence(scenarioInsights.score)}
                        caption={
                          scenario.budgetDelta !== 0 || scenario.addChannel.trim().length > 0
                            ? 'Scenario applied — you’re viewing a “what-if” version of your plan.'
                            : 'Baseline plan — try What‑if mode to see how tweaks change outcomes.'
                        }
                      />

                      <LineChart data={scenarioInsights.projection} />
                    </>
                  );
                })()}

                <View style={{ height: spacing.lg }} />

                <SectionHeader
                  title="Actionable improvement tips"
                  subtitle="Practical next steps you can execute this week."
                />
                {(() => {
                  const scenarioAnswers = applyScenarioToAnswers(answers, scenario);
                  const scenarioInsights = generateMarketingInsights(scenarioAnswers);
                  return <TipsList tips={scenarioInsights.tips} />;
                })()}

                <View style={{ height: spacing.lg }} />
                <SavedPlansCard
                  plans={savedPlans}
                  onLoad={(p) => {
                    setAnswers(p.answers);
                    setScenario(p.scenario);
                    setInsightsState({ status: 'ready', data: p.insights });
                    setQuestionIndex(QUESTIONS.length);
                    setToast('Loaded plan');
                  }}
                  onDelete={async (p) => {
                    const next = await deleteSavedPlan(p.id);
                    setSavedPlans(next);
                    setToast('Deleted');
                  }}
                />
              </>
            )}
          </View>

          <View style={styles.footerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={startConversation}
              style={({ pressed }) => [styles.reset, pressed ? styles.resetPressed : null]}
            >
              <Text style={styles.resetText}>Start over</Text>
            </Pressable>
          </View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>

        <ChatComposer
          placeholder={composer.placeholder}
          disabled={composer.disabled}
          onSend={onSend}
        />

        <StatusBar style="dark" />
      </LinearGradient>

      {toast ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
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
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: typography.body * 1.4,
    color: colors.mutedText,
  },
  chatCard: {
    marginBottom: spacing.lg,
  },
  chatTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chatTranscript: {
    gap: 0,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressWrap: {
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#EFE7DB',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressText: {
    marginTop: spacing.xs,
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnText: {
    fontSize: typography.small,
    fontWeight: '900',
    color: colors.text,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 86,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  toastText: {
    color: '#fff',
    fontSize: typography.small,
    fontWeight: '800',
  },
  results: {
    marginTop: spacing.sm,
  },
  muted: {
    fontSize: typography.body,
    color: colors.mutedText,
    lineHeight: typography.body * 1.45,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: colors.danger,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.body * 1.45,
  },
  footerActions: {
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },
  reset: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resetPressed: {
    opacity: 0.85,
  },
  resetText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
});
