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
import { ChatBubble } from './src/components/ChatBubble';
import { ChatComposer } from './src/components/ChatComposer';
import { CompanyOverviewCard } from './src/components/CompanyOverviewCard';
import { Card } from './src/components/Card';
import { LineChart } from './src/components/LineChart';
import { SectionHeader } from './src/components/SectionHeader';
import { TipsList } from './src/components/TipsList';
import { colors, radii, spacing, typography } from './src/constants/theme';
import type { ChatMessage, MarketingAnswers, MarketingInsights } from './src/types/marketing';
import { makeId } from './src/utils/id';
import { generateMarketingInsights } from './src/utils/marketingInsights';

export default function App() {
  const QUESTIONS: Array<{
    key: keyof MarketingAnswers;
    prompt: string;
    placeholder: string;
  }> = useMemo(
    () => [
      {
        key: 'companyName',
        prompt: `Hi! I’ll help you analyze and improve your marketing plan.\n\nWhat’s your company name?`,
        placeholder: 'Company name',
      },
      {
        key: 'productOrService',
        prompt: `Great — what product or service do you sell?`,
        placeholder: 'e.g., meal kit delivery for busy families',
      },
      {
        key: 'targetAudience',
        prompt: `Who is your target audience?\n\nTry to be specific (role/title, industry, location, pain point).`,
        placeholder: 'e.g., founders of small SaaS companies in the US',
      },
      {
        key: 'channels',
        prompt: `Which marketing channels will you use?\n\nList what you plan to run (comma-separated).`,
        placeholder: 'e.g., SEO, Instagram, partnerships, email',
      },
      {
        key: 'budget',
        prompt: `What’s your approximate monthly marketing budget?\n\nYou can type a number or include currency.`,
        placeholder: 'e.g., $500/month',
      },
      {
        key: 'goals',
        prompt: `What are your goals for the next 3 months?\n\nInclude a metric + timeframe if you can.`,
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
    setMessages([
      {
        id: makeId('msg'),
        role: 'assistant',
        text: QUESTIONS[0].prompt,
        createdAt: Date.now(),
      },
    ]);
  }, [QUESTIONS]);

  useEffect(() => {
    // Initialize the first assistant message once.
    startConversation();
  }, [startConversation]);

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

  const composer = useMemo(() => {
    if (insightsState.status === 'loading') {
      return { placeholder: 'Analyzing…', disabled: true };
    }
    if (isComplete) {
      return { placeholder: 'Done! Tap “Start over” to run again.', disabled: true };
    }
    return { placeholder: current?.placeholder ?? 'Type your answer…', disabled: false };
  }, [current, insightsState.status, isComplete]);

  const onSend = useCallback(
    (text: string) => {
      if (!current) return;

      // Append the user's message.
      setMessages((m) => [
        ...m,
        { id: makeId('msg'), role: 'user', text, createdAt: Date.now() },
      ]);

      // Save answer.
      setAnswers((a) => ({ ...a, [current.key]: text }));

      // Move to next question.
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);

      // Append next assistant prompt (or completion message).
      const next = QUESTIONS[nextIndex];
      setMessages((m) => [
        ...m,
        {
          id: makeId('msg'),
          role: 'assistant',
          text: next
            ? next.prompt
            : `Thanks — that’s everything I need.\n\nScroll down for your marketing success projection and a set of actionable improvements.`,
          createdAt: Date.now(),
        },
      ]);
    },
    [QUESTIONS, current, questionIndex]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          ref={(r) => {
            scrollRef.current = r;
          }}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Marketing Plan Analysis</Text>
            <Text style={styles.subtitle}>
              Answer a few guided questions to get a projection and improvement tips.
            </Text>
          </View>

          <CompanyOverviewCard
            companyName={answers.companyName}
            productOrService={answers.productOrService}
          />

          <Card style={styles.chatCard}>
            <Text style={styles.chatTitle}>Chat</Text>
            <View style={styles.chatTranscript}>
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} text={m.text} />
              ))}
            </View>
          </Card>

          <View style={styles.results}>
            <SectionHeader
              title="Marketing success over time"
              subtitle="A simulated projection (0–100) based on your inputs. Use it as directional guidance—not a guarantee."
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
                <Card style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>Projected success score</Text>
                  <Text style={styles.scoreValue}>{insightsState.data.score}/100</Text>
                  <Text style={styles.scoreNote}>
                    Improve the weakest inputs (audience, channels, budget clarity, measurable goals) to raise your score.
                  </Text>
                </Card>

                <LineChart data={insightsState.data.projection} />

                <View style={{ height: spacing.lg }} />

                <SectionHeader
                  title="Actionable improvement tips"
                  subtitle="Practical next steps you can execute this week."
                />
                <TipsList tips={insightsState.data.tips} />
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
      </View>
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
  scoreCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.primarySoft,
    borderColor: '#C7DAFF',
    borderRadius: radii.lg,
  },
  scoreLabel: {
    fontSize: typography.small,
    color: colors.mutedText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scoreValue: {
    marginTop: spacing.sm,
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  scoreNote: {
    marginTop: spacing.sm,
    fontSize: typography.small,
    color: colors.mutedText,
    lineHeight: typography.small * 1.45,
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
