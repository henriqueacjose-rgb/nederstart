'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LevelNodeData } from '@/lib/course';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  Circle,
  Star,
  Clock,
} from 'lucide-react';

export function CourseMap({
  locale,
  levels,
}: {
  locale: string;
  levels: LevelNodeData[];
}) {
  const t = useTranslations('course');
  const tc = useTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-8">
        {levels.map((level) => {
          const percent =
            level.totalLessons > 0
              ? Math.round((level.completedLessons / level.totalLessons) * 100)
              : 0;
          const levelLocked = !level.isPublished;

          return (
            <section
              key={level.id}
              className={cn(
                'rounded-2xl border bg-card p-5 shadow-sm md:p-6',
                levelLocked && 'opacity-70'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold',
                      levelLocked
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {level.code}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                      {level.title}
                    </h2>
                    {level.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    )}
                  </div>
                </div>
                {levelLocked && (
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Lock className="h-3 w-3" />
                    {t('comingSoonLevel')}
                  </Badge>
                )}
              </div>

              {!levelLocked && level.totalLessons > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('complete', { percent })}</span>
                    <span>
                      {level.completedLessons}/{level.totalLessons}{' '}
                      {t('lessons')}
                    </span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              )}

              {!levelLocked &&
                level.modules.map((mod) => (
                  <div key={mod.id} className="mt-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('module')} {mod.sortOrder}
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <h3 className="mb-3 font-semibold">{mod.title}</h3>
                    <div className="space-y-2.5">
                      {mod.lessons.map((lesson) => {
                        const inner = (
                          <div
                            className={cn(
                              'flex items-center gap-3 rounded-xl border bg-background p-3.5 transition-all',
                              lesson.locked
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:border-primary/50 hover:shadow-sm'
                            )}
                          >
                            <div className="shrink-0">
                              {lesson.locked ? (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              ) : lesson.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : lesson.status === 'in_progress' ? (
                                <PlayCircle className="h-5 w-5 text-accent" />
                              ) : (
                                <Circle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium">
                                  {lesson.title}
                                </span>
                                {lesson.isFree && (
                                  <Badge
                                    variant="outline"
                                    className="shrink-0 border-accent/40 text-accent"
                                  >
                                    {t('freeBadge')}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.estimatedMinutes} {tc('minutes')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {lesson.xpReward} XP
                                </span>
                                {lesson.locked && (
                                  <span className="italic">
                                    {t('lockedLesson')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!lesson.locked && (
                              <span className="shrink-0 text-sm font-medium text-primary">
                                {lesson.status === 'completed'
                                  ? t('reviewLesson')
                                  : lesson.status === 'in_progress'
                                    ? t('continueLesson')
                                    : t('startLesson')}
                              </span>
                            )}
                          </div>
                        );

                        return lesson.locked ? (
                          <div key={lesson.id}>{inner}</div>
                        ) : (
                          <Link
                            key={lesson.id}
                            href={`/${locale}/lessons/${lesson.lessonCode}`}
                          >
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {levelLocked && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {t('comingSoonLevel')}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
