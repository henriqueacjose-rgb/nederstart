import { prisma } from '@/lib/prisma';
import { getTotalXp } from '@/lib/gamification';

export interface LevelProgress {
  code: string;
  title: string;
  completed: number;
  total: number;
  isPublished: boolean;
}

export interface AchievementProgress {
  code: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned: boolean;
  earnedAt: string | null;
}

export interface ProgressData {
  totalXp: number;
  lessonsCompleted: number;
  wordsMastered: number;
  wordsLearning: number;
  currentStreak: number;
  longestStreak: number;
  studyMinutes: number;
  levels: LevelProgress[];
  achievements: AchievementProgress[];
}

type TranslationLike = {
  locale: string;
  title?: string | null;
  description?: string | null;
};

function pickTitle(
  arr: TranslationLike[],
  locale: string
): TranslationLike | undefined {
  return (
    arr.find(
      (x: TranslationLike) =>
        x.locale === locale
    ) ??
    arr.find(
      (x: TranslationLike) =>
        x.locale === 'en'
    ) ??
    arr[0]
  );
}

export async function getProgressData(
  userId: string,
  locale: string
): Promise<ProgressData> {
  const [
    totalXp,
    lessonsCompleted,
    wordsMastered,
    wordsLearning,
    streak,
    timeAgg,
    levels,
    completedRows,
    achievements,
    userAchievements,
  ] = await Promise.all([
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
        status: 'mastered',
      },
    }),

    prisma.vocabularyProgress.count({
      where: {
        userId,
        status: 'learning',
      },
    }),

    prisma.userStreak.findUnique({
      where: {
        userId,
      },
    }),

    prisma.lessonProgress.aggregate({
      where: {
        userId,
      },
      _sum: {
        timeSpentS: true,
      },
    }),

    prisma.level.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        translations: true,

        modules: {
          where: {
            isPublished: true,
          },
          include: {
            lessons: {
              where: {
                isPublished: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    }),

    prisma.lessonProgress.findMany({
      where: {
        userId,
        status: 'completed',
      },
      select: {
        lessonId: true,
      },
    }),

    prisma.achievement.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        translations: true,
      },
    }),

    prisma.userAchievement.findMany({
      where: {
        userId,
      },
    }),
  ]);

  const completedSet =
    new Set<number>(
      (
        completedRows as any[]
      ).map(
        (row: any) =>
          row.lessonId
      )
    );

  const levelProgress:
    LevelProgress[] = (
    levels as any[]
  ).map((lvl: any) => {
    const lessonIds:
      number[] = (
      lvl.modules as any[]
    ).flatMap((module: any) =>
      (
        module.lessons as any[]
      ).map(
        (lesson: any) =>
          lesson.id
      )
    );

    const completed =
      lessonIds.filter(
        (id: number) =>
          completedSet.has(id)
      ).length;

    const t = pickTitle(
      lvl
        .translations as TranslationLike[],
      locale
    );

    return {
      code: lvl.code,

      title:
        t?.title ??
        lvl.code,

      completed,

      total:
        lessonIds.length,

      isPublished:
        lvl.isPublished,
    };
  });

  const earnedMap =
    new Map<number, Date | null>(
      (
        userAchievements as any[]
      ).map((ua: any) => [
        ua.achievementId,
        ua.earnedAt,
      ])
    );

  const achievementProgress:
    AchievementProgress[] = (
    achievements as any[]
  ).map((achievement: any) => {
    const t = pickTitle(
      achievement
        .translations as TranslationLike[],
      locale
    );

    const earnedAt =
      earnedMap.get(
        achievement.id
      );

    return {
      code:
        achievement.code,

      title:
        t?.title ??
        achievement.code,

      description:
        t?.description ??
        null,

      icon:
        achievement.icon,

      earned:
        earnedMap.has(
          achievement.id
        ),

      earnedAt:
        earnedAt
          ? earnedAt.toISOString()
          : null,
    };
  });

  return {
    totalXp,

    lessonsCompleted,

    wordsMastered,

    wordsLearning,

    currentStreak:
      streak?.currentStreak ??
      0,

    longestStreak:
      streak?.longestStreak ??
      0,

    studyMinutes:
      Math.round(
        (
          timeAgg._sum
            .timeSpentS ?? 0
        ) / 60
      ),

    levels:
      levelProgress,

    achievements:
      achievementProgress,
  };
}