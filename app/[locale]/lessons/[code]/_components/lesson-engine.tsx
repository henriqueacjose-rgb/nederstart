'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { LessonData, LessonSectionData } from '@/lib/lesson';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { VocabCard } from './vocab-card';
import { AudioButton } from './audio-button';
import { ExerciseRunner } from './exercise-runner';
import { cn } from '@/lib/utils';
import {
  X,
  ArrowRight,
  BookOpen,
  Headphones,
  Trophy,
  Star,
  Flame,
  CheckCircle2,
  Target,
} from 'lucide-react';

interface CompleteResult {
  xpEarned: number;
  lessonXp: number;
  totalXp: number;
  streak: { current: number; longest: number; increased: boolean };
  newAchievements: { code: string; title: string; icon: string | null; xpBonus: number }[];
  alreadyCompleted: boolean;
}

export function LessonEngine({
  locale,
  lesson,
}: {
  locale: string;
  lesson: LessonData;
}) {
  const t = useTranslations('lesson');
  const tc = useTranslations('common');
  const te = useTranslations('exercise');
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const sections = lesson.sections;
  const totalSteps = sections.length;
  const currentSection = sections[step];

  // Fire start on mount.
  useEffect(() => {
    startTimeRef.current = Date.now();
    fetch(`/api/lessons/${lesson.lessonCode}/start`, { method: 'POST' }).catch(
      () => {}
    );
  }, [lesson.lessonCode]);

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitCompletion = async (score: number) => {
    setSubmitting(true);
    const timeSpentS = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await fetch(`/api/lessons/${lesson.lessonCode}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, timeSpentS }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setFinished(true);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    submitCompletion(score);
  };

  // Completion screen.
  if (finished) {
    return (
      <CompletionScreen
        locale={locale}
        lesson={lesson}
        score={quizScore}
        result={result}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link href={`/${locale}/learn`} aria-label={t('exit')}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <Progress
              value={((step + 1) / totalSteps) * 100}
              className="h-2"
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {t('stepOf', { current: step + 1, total: totalSteps })}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {currentSection?.sectionType === 'intro' && (
          <IntroSection lesson={lesson} section={currentSection} locale={locale} />
        )}
        {currentSection?.sectionType === 'vocab' && (
          <VocabSection section={currentSection} />
        )}
        {currentSection?.sectionType === 'quiz' && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {t('quiz')}
              </h2>
            </div>
            {currentSection.exercises && currentSection.exercises.length > 0 ? (
              <ExerciseRunner
                exercises={currentSection.exercises}
                onComplete={handleQuizComplete}
              />
            ) : (
              <div className="text-center">
                <Button onClick={() => submitCompletion(100)}>
                  {tc('finish')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Continue button for non-quiz steps */}
        {currentSection?.sectionType !== 'quiz' && (
          <div className="mt-8">
            <Button className="w-full" size="lg" onClick={goNext} disabled={submitting}>
              {tc('continue')}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function IntroSection({
  lesson,
  section,
  locale,
}: {
  lesson: LessonData;
  section: LessonSectionData;
  locale: string;
}) {
  const t = useTranslations('lesson');
  const tc = useTranslations('common');
  const introText =
    (section.content?.[locale] as string) ||
    (section.content?.en as string) ||
    lesson.description ||
    '';

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="secondary">{lesson.levelCode}</Badge>
        {lesson.isFree && (
          <Badge variant="outline" className="border-accent/40 text-accent">
            {tc('free')}
          </Badge>
        )}
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        {lesson.title}
      </h1>
      {introText && (
        <p className="mt-3 text-lg text-muted-foreground">{introText}</p>
      )}

      {lesson.learningObjectives.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">{t('whatYouLearn')}</h2>
          </div>
          <ul className="space-y-2">
            {lesson.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VocabSection({ section }: { section: LessonSectionData }) {
  const t = useTranslations('lesson');
  const vocab = section.vocab ?? [];

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Headphones className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {t('vocabulary')}
        </h2>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">{t('speakHint')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {vocab.map((v) => (
          <VocabCard key={v.id} vocab={v} />
        ))}
      </div>
    </div>
  );
}

function CompletionScreen({
  locale,
  lesson,
  score,
  result,
}: {
  locale: string;
  lesson: LessonData;
  score: number;
  result: CompleteResult | null;
}) {
  const t = useTranslations('lesson');
  const te = useTranslations('exercise');
  const tc = useTranslations('common');
  const passed = score >= 60;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Trophy className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
        {t('complete')}
      </h1>
      <p className="mt-2 text-muted-foreground">{t('completeSubtitle')}</p>

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <Star className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 font-display text-2xl font-bold">
            +{result?.xpEarned ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <Flame className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-2 font-display text-2xl font-bold">
            {result?.streak.current ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            {te('score', { score })}
          </p>
        </div>
      </div>

      {result?.alreadyCompleted && (
        <p className="mt-3 text-xs text-muted-foreground">
          {tc('completed')}
        </p>
      )}

      {result && result.newAchievements.length > 0 && (
        <div className="mt-5 w-full space-y-2">
          {result.newAchievements.map((a) => (
            <div
              key={a.code}
              className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 text-left"
            >
              <span className="text-2xl">{a.icon ?? '\u{1F3C6}'}</span>
              <div>
                <p className="font-semibold">{a.title}</p>
                {a.xpBonus > 0 && (
                  <p className="text-xs text-muted-foreground">
                    +{a.xpBonus} XP
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-2">
        {lesson.nextLessonCode ? (
          <Link
            href={`/${locale}/lessons/${lesson.nextLessonCode}`}
            className="w-full"
          >
            <Button className="w-full" size="lg">
              {t('nextLesson')}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
        <Link href={`/${locale}/learn`} className="w-full">
          <Button variant="outline" className="w-full" size="lg">
            {t('backToCourse')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
