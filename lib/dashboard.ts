import { prisma } from '@/lib/prisma';
import { getTotalXp } from '@/lib/gamification';

function todayRangeInTz(): { start: Date; end: Date } {
  const now = new Date();

  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const start = new Date(`${ymd}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

export interface RecentActivityItem {
  lessonCode: string;
  title: string;
  completedAt: string;
  score: number;
}

export interface DashboardData {
  displayName: string | null;
  totalXp: number;
  lessonsCompleted: number;
  wordsLearned: number;
  wordsToReview: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoalMinutes: number;
  minutesToday: number;
  continueLesson: {
    code: string;
    title: string;
    isNew: boolean;
  } | null;
  recent: RecentActivityItem[];
}

type TranslationLike = {
  locale: string;
  title: string;
};

export async function getDashboardData(
  userId: string,
  locale: string
): Promise<DashboardData> {
  const { start, end } = todayRangeInTz();

  const [
    user,
    totalXp,
    lessonsCompleted,
    wordsLearned,
    wordsToReview,
    streak,
    todayProgress,
    recentProgress,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        displayName: true,
        studyFrequency: true,
      },
    }),

    getTotalXp(userId),

    prisma.lessonProgress.count({
      where: {
        userId,
        status: 'completed',
      },
    }),

    prisma.vocabularyProgress.count({
      where: {
        userId,
      },
    }),

    prisma.vocabularyProgress.count({
      where: {
        userId,
        nextReview: {
          lte: new Date(),
        },
      },
    }),

    prisma.userStreak.findUnique({
      where: {
        userId,
      },
    }),

    prisma.lessonProgress.findMany({
      where: {
        userId,
        completedAt: {
          gte: start,
          lt: end,
        },
      },
      select: {
        timeSpentS: true,
      },
    }),

    prisma.lessonProgress.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
      include: {
        lesson: {
          include: {
            translations: true,
          },
        },
      },
    }),
  ]);

  const minutesToday = Math.round(
    todayProgress.reduce(
      (sum: number, progress: any) =>
        sum + (progress.timeSpentS ?? 0),
      0
    ) / 60
  );

  const pickTitle = (
    translations: TranslationLike[],
    code: string
  ): string =>
    translations.find((x) => x.locale === locale)?.title ??
    translations.find((x) => x.locale === 'en')?.title ??
    code;

  const recent: RecentActivityItem[] = recentProgress.map(
    (progress: any) => ({
      lessonCode: progress.lesson.lessonCode,
      title: pickTitle(
        progress.lesson.translations as TranslationLike[],
        progress.lesson.lessonCode
      ),
      completedAt:
        progress.completedAt?.toISOString() ?? '',
      score: progress.score ?? 0,
    })
  );

  const lessons = await prisma.lesson.findMany({
    where: {
      isPublished: true,
      module: {
        isPublished: true,
        level: {
          isPublished: true,
        },
      },
    },
    include: {
      module: true,
      translations: true,
    },
  });

  const ordered = lessons.sort((a: any, b: any) => {
    if (a.module.sortOrder !== b.module.sortOrder) {
      return a.module.sortOrder - b.module.sortOrder;
    }

    return a.sortOrder - b.sortOrder;
  });

  const completedRows =
    await prisma.lessonProgress.findMany({
      where: {
        userId,
        status: 'completed',
      },
      select: {
        lessonId: true,
      },
    });

  const completedSet = new Set<number>(
    completedRows.map((row: any) => row.lessonId)
  );

  const next = ordered.find(
    (lesson: any) => !completedSet.has(lesson.id)
  );

  const continueLesson = next
    ? {
        code: next.lessonCode,
        title: pickTitle(
          next.translations as TranslationLike[],
          next.lessonCode
        ),
        isNew: completedSet.size === 0,
      }
    : null;

  return {
    displayName: user?.displayName ?? null,
    totalXp,
    lessonsCompleted,
    wordsLearned,
    wordsToReview,
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    dailyGoalMinutes: user?.studyFrequency ?? 15,
    minutesToday,
    continueLesson,
    recent,
  };
}