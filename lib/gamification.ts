import { prisma } from '@/lib/prisma';

// Returns YYYY-MM-DD in Europe/Amsterdam to define a "study day".
function todayInTz(): Date {
  const now = new Date();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  return new Date(`${parts}T00:00:00.000Z`);
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function awardXp(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string
) {
  if (amount <= 0) return;

  await prisma.userXpEvent.create({
    data: {
      userId,
      xpAmount: amount,
      reason,
      referenceId: referenceId ?? null,
    },
  });
}

export async function getTotalXp(
  userId: string
): Promise<number> {
  const agg = await prisma.userXpEvent.aggregate({
    where: {
      userId,
    },
    _sum: {
      xpAmount: true,
    },
  });

  return agg._sum.xpAmount ?? 0;
}

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  increased: boolean;
}

export async function updateStreak(
  userId: string
): Promise<StreakResult> {
  const today = todayInTz();

  const streak = await prisma.userStreak.findUnique({
    where: {
      userId,
    },
  });

  if (!streak) {
    const created = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      },
    });

    return {
      currentStreak: created.currentStreak,
      longestStreak: created.longestStreak,
      increased: true,
    };
  }

  const last = streak.lastActivityDate
    ? new Date(streak.lastActivityDate)
    : null;

  if (last) {
    const diff = daysBetween(last, today);

    if (diff === 0) {
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        increased: false,
      };
    }
  }

  let newCurrent: number;

  if (last && daysBetween(last, today) === 1) {
    newCurrent = streak.currentStreak + 1;
  } else {
    newCurrent = 1;
  }

  const newLongest = Math.max(
    newCurrent,
    streak.longestStreak
  );

  await prisma.userStreak.update({
    where: {
      userId,
    },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActivityDate: today,
    },
  });

  return {
    currentStreak: newCurrent,
    longestStreak: newLongest,
    increased: true,
  };
}

export interface AwardedAchievement {
  code: string;
  title: string;
  icon: string | null;
  xpBonus: number;
}

type AchievementTranslation = {
  locale: string;
  title?: string | null;
};

export async function evaluateAchievements(
  userId: string,
  locale: string
): Promise<AwardedAchievement[]> {
  const [
    completedCount,
    streak,
    a0Lessons,
    earned,
  ] = await Promise.all([
    prisma.lessonProgress.count({
      where: {
        userId,
        status: 'completed',
      },
    }),

    prisma.userStreak.findUnique({
      where: {
        userId,
      },
    }),

    prisma.lesson.findMany({
      where: {
        isPublished: true,
        module: {
          level: {
            code: 'A0',
          },
        },
      },
      select: {
        id: true,
      },
    }),

    prisma.userAchievement.findMany({
      where: {
        userId,
      },
    }),
  ]);

  const earnedCodes = new Set<number>(
    earned.map(
      (item: any) => item.achievementId
    )
  );

  const toAward: string[] = [];

  if (completedCount >= 1) {
    toAward.push('first_lesson');
  }

  if ((streak?.currentStreak ?? 0) >= 7) {
    toAward.push('streak_7');
  }

  if ((streak?.currentStreak ?? 0) >= 30) {
    toAward.push('streak_30');
  }

  if (a0Lessons.length > 0) {
    const a0Ids = a0Lessons.map(
      (lesson: any) => lesson.id
    );

    const a0Completed =
      await prisma.lessonProgress.count({
        where: {
          userId,
          status: 'completed',
          lessonId: {
            in: a0Ids,
          },
        },
      });

    if (a0Completed >= a0Lessons.length) {
      toAward.push('a0_complete');
    }
  }

  if (toAward.length === 0) {
    return [];
  }

  const achievements =
    await prisma.achievement.findMany({
      where: {
        code: {
          in: toAward,
        },
      },
      include: {
        translations: true,
      },
    });

  const newlyAwarded: AwardedAchievement[] = [];

  for (const ach of achievements as any[]) {
    if (earnedCodes.has(ach.id)) {
      continue;
    }

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: ach.id,
      },
    });

    if (ach.xpBonus > 0) {
      await awardXp(
        userId,
        ach.xpBonus,
        'achievement',
        ach.code
      );
    }

    const translations =
      ach.translations as AchievementTranslation[];

    const t =
      translations.find(
        (x: AchievementTranslation) =>
          x.locale === locale
      ) ??
      translations.find(
        (x: AchievementTranslation) =>
          x.locale === 'en'
      ) ??
      translations[0];

    newlyAwarded.push({
      code: ach.code,
      title: t?.title ?? ach.code,
      icon: ach.icon,
      xpBonus: ach.xpBonus,
    });
  }

  return newlyAwarded;
}