export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, lessonProgress, vocabularyProgress, xpEvents, achievements, streak] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            displayName: true,
            uiLocale: true,
            learningGoal: true,
            studyFrequency: true,
            startingLevel: true,
            plan: true,
            createdAt: true,
          },
        }),
        prisma.lessonProgress.findMany({
          where: { userId },
          include: {
            lesson: {
              select: {
                lessonCode: true,
              },
            },
          },
        }),
        prisma.vocabularyProgress.findMany({
          where: { userId },
          include: {
            vocabulary: {
              select: {
                dutchWord: true,
              },
            },
          },
        }),
        prisma.userXpEvent.findMany({
          where: { userId },
        }),
        prisma.userAchievement.findMany({
          where: { userId },
          include: {
            achievement: {
              select: {
                code: true,
              },
            },
          },
        }),
        prisma.userStreak.findUnique({
          where: { userId },
        }),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: user,
      streak,
      lessonProgress: lessonProgress.map((p: any) => ({
        lesson: p.lesson.lessonCode,
        status: p.status,
        score: p.score,
        timeSpentS: p.timeSpentS,
        completedAt: p.completedAt,
      })),
      vocabularyProgress: vocabularyProgress.map((p: any) => ({
        word: p.vocabulary.dutchWord,
        status: p.status,
        correctCount: p.correctCount,
        incorrectCount: p.incorrectCount,
      })),
      xpEvents: xpEvents.map((e: any) => ({
        amount: e.xpAmount,
        reason: e.reason,
        at: e.createdAt,
      })),
      achievements: achievements.map((a: any) => a.achievement.code),
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="nederstart-data.json"',
      },
    });
  } catch (error) {
    console.error('Data export error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}