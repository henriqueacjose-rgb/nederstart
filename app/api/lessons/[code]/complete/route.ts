export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  awardXp,
  getTotalXp,
  updateStreak,
  evaluateAchievements,
} from '@/lib/gamification';

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const locale = session.user.uiLocale ?? 'en';

    const body = await req.json().catch(() => ({}));
    const score = Math.max(0, Math.min(100, Number(body?.score ?? 0)));
    const timeSpentS = Math.max(0, Number(body?.timeSpentS ?? 0));

    const lesson = await prisma.lesson.findUnique({
      where: { lessonCode: params.code },
      include: { lessonVocabulary: true },
    });
    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existing = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    });
    const alreadyCompleted = existing?.status === 'completed';

    // Upsert progress.
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: {
        status: 'completed',
        score: Math.max(score, existing?.score ?? 0),
        timeSpentS: (existing?.timeSpentS ?? 0) + timeSpentS,
        completedAt: new Date(),
        attemptCount: (existing?.attemptCount ?? 0) + 1,
      },
      create: {
        userId,
        lessonId: lesson.id,
        status: 'completed',
        score,
        timeSpentS,
        startedAt: new Date(),
        completedAt: new Date(),
        attemptCount: 1,
      },
    });

    // Mark vocabulary as learning (first exposure).
    for (const lv of lesson.lessonVocabulary) {
      await prisma.vocabularyProgress.upsert({
        where: {
          userId_vocabularyId: { userId, vocabularyId: lv.vocabularyId },
        },
        update: {},
        create: {
          userId,
          vocabularyId: lv.vocabularyId,
          status: 'learning',
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    // Award XP only on first completion.
    let xpEarned = 0;
    if (!alreadyCompleted) {
      xpEarned = lesson.xpReward;
      await awardXp(userId, xpEarned, 'lesson_complete', lesson.lessonCode);
    }

    const streak = await updateStreak(userId);
    const newAchievements = await evaluateAchievements(userId, locale);
    const achievementXp = newAchievements.reduce((s, a) => s + a.xpBonus, 0);
    const totalXp = await getTotalXp(userId);

    return NextResponse.json({
      ok: true,
      alreadyCompleted,
      xpEarned: xpEarned + achievementXp,
      lessonXp: xpEarned,
      totalXp,
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        increased: streak.increased,
      },
      newAchievements,
    });
  } catch (error: any) {
    console.error('Lesson complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
