'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { DashboardData } from '@/lib/dashboard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SafeDate } from '@/components/safe-format';
import { cn } from '@/lib/utils';
import {
  Flame,
  Star,
  BookOpen,
  GraduationCap,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Target,
} from 'lucide-react';

export function DashboardView({
  locale,
  data,
}: {
  locale: string;
  data: DashboardData;
}) {
  const t = useTranslations('dashboard');
  const goalPercent =
    data.dailyGoalMinutes > 0
      ? Math.min(100, Math.round((data.minutesToday / data.dailyGoalMinutes) * 100))
      : 0;
  const goalMet = data.minutesToday >= data.dailyGoalMinutes;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {data.displayName
            ? t('welcome', { name: data.displayName })
            : t('welcomeGeneric')}
        </h1>
      </div>

      {/* Continue learning + daily goal */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            {data.continueLesson?.isNew ? t('startLearning') : t('continueLearning')}
          </div>
          {data.continueLesson ? (
            <>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                {data.continueLesson.isNew ? t('nextUp') : t('currentLesson')}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                {data.continueLesson.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/${locale}/lessons/${data.continueLesson.code}`}>
                  <Button size="lg">
                    {data.continueLesson.isNew ? t('startLearning') : t('continueLearning')}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/learn`}>
                  <Button size="lg" variant="outline">
                    {t('viewCourse')}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                {t('dailyGoalMet')}
              </h2>
              <div className="mt-4">
                <Link href={`/${locale}/learn`}>
                  <Button size="lg" variant="outline">
                    {t('viewCourse')}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            {t('dailyGoal')}
          </div>
          <p className="mt-3 font-display text-2xl font-bold">
            {t('minutesToday', {
              done: data.minutesToday,
              goal: data.dailyGoalMinutes,
            })}
          </p>
          <Progress value={goalPercent} className="mt-3 h-2" />
          {goalMet && (
            <p className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {t('dailyGoalMet')}
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Flame className="h-5 w-5 text-accent" />}
          value={String(data.currentStreak)}
          label={t('streak')}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-accent" />}
          value={String(data.totalXp)}
          label={t('totalXp')}
        />
        <StatCard
          icon={<GraduationCap className="h-5 w-5 text-primary" />}
          value={String(data.lessonsCompleted)}
          label={t('lessonsCompleted')}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          value={String(data.wordsLearned)}
          label={t('wordsLearned')}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Words to review */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            {t('wordsToReview')}
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {data.wordsToReview}
          </p>
          {data.wordsToReview > 0 && (
            <Link href={`/${locale}/review`} className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                {t('reviewNow')}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            {t('recentActivity')}
          </div>
          {data.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noActivity')}</p>
          ) : (
            <ul className="space-y-2.5">
              {data.recent.map((r) => (
                <li
                  key={r.lessonCode + r.completedAt}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {r.score}%
                    </Badge>
                    {r.completedAt && (
                      <SafeDate
                        date={r.completedAt}
                        locale={locale === 'pt' ? 'pt-BR' : 'en-US'}
                        options={{ month: 'short', day: 'numeric' }}
                        className="text-xs"
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
