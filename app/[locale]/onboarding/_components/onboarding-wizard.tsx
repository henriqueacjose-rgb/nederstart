'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Home,
  GraduationCap,
  Heart,
  Plane,
  Landmark,
  Sparkles,
  Languages,
  Loader2,
  Check,
} from 'lucide-react';

type GoalKey =
  | 'work'
  | 'living'
  | 'study'
  | 'relationship'
  | 'travel'
  | 'integration'
  | 'personal';
type LevelKey = 'none' | 'beginner' | 'basic' | 'intermediate' | 'advanced';

const GOAL_ICONS: Record<GoalKey, any> = {
  work: Briefcase,
  living: Home,
  study: GraduationCap,
  relationship: Heart,
  travel: Plane,
  integration: Landmark,
  personal: Sparkles,
};

const GOALS: GoalKey[] = [
  'living',
  'work',
  'integration',
  'study',
  'relationship',
  'travel',
  'personal',
];
const LEVELS: LevelKey[] = ['none', 'beginner', 'basic', 'intermediate', 'advanced'];
const FREQUENCIES: { value: number; label: string }[] = [
  { value: 5, label: 'casual' },
  { value: 10, label: 'regular' },
  { value: 15, label: 'serious' },
  { value: 30, label: 'intense' },
];

const TOTAL_STEPS = 4;

export function OnboardingWizard({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const tc = useTranslations('common');
  const router = useRouter();
  const { update } = useSession() || {};

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalKey | null>(null);
  const [uiLocale, setUiLocale] = useState<string>(locale === 'pt' ? 'pt' : 'en');
  const [level, setLevel] = useState<LevelKey | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed =
    (step === 0 && goal) ||
    (step === 1 && uiLocale) ||
    (step === 2 && level) ||
    (step === 3 && frequency);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningGoal: goal,
          uiLocale,
          level,
          studyFrequency: frequency,
        }),
      });
      if (!res.ok) {
        setError(tc('error'));
        setLoading(false);
        return;
      }
      // Propagate the change into the live session so middleware lets us pass.
      await update?.({ onboardingCompleted: true, uiLocale });
      const target = uiLocale === 'pt' ? 'pt' : 'en';
      router.replace(`/${target}/dashboard`);
    } catch {
      setError(tc('error'));
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('step', { current: step + 1, total: TOTAL_STEPS })}</span>
          <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-2" />
      </div>

      <div className="flex-1">
        {/* Step 0: Goal */}
        {step === 0 && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t('goalTitle')}
            </h1>
            <p className="mt-2 text-muted-foreground">{t('goalSubtitle')}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOALS.map((g) => {
                const Icon = GOAL_ICONS[g];
                const selected = goal === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{t(`goals.${g}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Locale */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t('localeTitle')}
            </h1>
            <p className="mt-2 text-muted-foreground">{t('localeSubtitle')}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {['en', 'pt'].map((loc) => {
                const selected = uiLocale === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setUiLocale(loc)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {loc === 'pt' ? '\ud83c\udde7\ud83c\uddf7' : '\ud83c\uddec\ud83c\udde7'}
                    </div>
                    <span className="font-medium">{t(`locales.${loc}`)}</span>
                    {selected && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Level */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t('levelTitle')}
            </h1>
            <p className="mt-2 text-muted-foreground">{t('levelSubtitle')}</p>
            <div className="mt-6 space-y-3">
              {LEVELS.map((lv) => {
                const selected = level === lv;
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setLevel(lv)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <span className="font-medium">{t(`levels.${lv}`)}</span>
                    {selected && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Frequency */}
        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              {t('frequencyTitle')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('frequencySubtitle')}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {FREQUENCIES.map((f) => {
                const selected = frequency === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border-2 bg-card p-5 text-center transition-all hover:border-primary/50 hover:shadow-sm',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border'
                    )}
                  >
                    <span className="font-display text-2xl font-bold text-primary">
                      {f.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tc('minutes')} / {t(`frequencyLabels.${f.label}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-destructive">{error}</p>
      )}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 0 || loading}
          className={cn(step === 0 && 'invisible')}
        >
          {tc('back')}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed || loading} size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {step === TOTAL_STEPS - 1 ? t('finish') : tc('next')}
        </Button>
      </div>
    </div>
  );
}
