export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { computeNextReview } from '@/lib/review';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const vocabularyId = Number(body?.vocabularyId);
    const correct = Boolean(body?.correct);
    if (!vocabularyId) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const existing = await prisma.vocabularyProgress.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
    });

    const prevCorrect = existing?.correctCount ?? 0;
    const { nextReviewMs, status } = computeNextReview(prevCorrect, correct);
    const nextReview = new Date(Date.now() + nextReviewMs);

    await prisma.vocabularyProgress.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      update: {
        status,
        correctCount: correct ? prevCorrect + 1 : 0,
        incorrectCount: correct
          ? existing?.incorrectCount ?? 0
          : (existing?.incorrectCount ?? 0) + 1,
        lastReviewed: new Date(),
        nextReview,
      },
      create: {
        userId,
        vocabularyId,
        status,
        correctCount: correct ? 1 : 0,
        incorrectCount: correct ? 0 : 1,
        lastReviewed: new Date(),
        nextReview,
      },
    });

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
