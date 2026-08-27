'use client';

import { useTranslations } from 'next-intl';
import type { ProgressData } from '@/lib/progress';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Star,
  GraduationCap,
  BookOpen,
  Flame,
  Trophy,
  Clock,
  Lock,
} from 'lucide-react';

export function ProgressView({ data }: { data: ProgressData }) {
  const t = useTranslations('progress');

  const stats = [
    { icon: <Star className="h-5 w-5 text-accent" />, value: data.totalXp, label: t('totalXp') },
    { icon: <GraduationCap className="h-5 w-5 text-primary" />, value: data.lessonsCompleted, label: t('lessonsCompleted') },
    { icon: <BookOpen className="h-5 w-5 text-primary" />, value: data.wordsMastered, label: t('wordsMastered') },
    { icon: <Flame className="h-5 w-5 text-accent" />, value: data.currentStreak, label: t('currentStreak') },
    { icon: <Flame className="h-5 w-5 text-muted-foreground" />, value: data.longestStreak, label: t('longestStreak') },
    { icon: <Clock className="h-5 w-5 text-primary" />, value: data.studyMinutes, label: t('studyTime') },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Overview stats */}
      <h2 className="mb-3 font-semibold">{t('overview')}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              {s.icon}
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* By level */}
      <h2 className="mb-3 mt-8 font-semibold">{t('byLevel')}</h2>
      <div className="space-y-3">
        {data.levels.map((lvl) => {
          const percent =
            lvl.total > 0 ? Math.round((lvl.completed / lvl.total) * 100) : 0;
          return (
            <div
              key={lvl.code}
              className={cn(
                'rounded-2xl border bg-card p-4 shadow-sm',
                !lvl.isPublished && 'opacity-60'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {lvl.code}
                  </span>
                  <span className="font-medium">{lvl.title}</span>
                  {!lvl.isPublished && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {lvl.completed}/{lvl.total}
                </span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <h2 className="mb-3 mt-8 flex items-center gap-2 font-semibold">
        <Trophy className="h-4 w-4 text-accent" />
        {t('achievements')}
      </h2>
      {data.achievements.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noAchievements')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.achievements.map((a) => (
            <div
              key={a.code}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 shadow-sm',
                a.earned ? 'bg-accent/5 border-accent/30' : 'bg-card opacity-60'
              )}
            >
              <span className={cn('text-3xl', !a.earned && 'grayscale')}>
                {a.icon ?? '\u{1F3C6}'}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
