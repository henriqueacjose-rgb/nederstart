export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { lessonCode: params.code },
      select: { id: true, isPublished: true },
    });
    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const userId = session.user.id;

    // Create the progress record if it does not exist yet. We catch the unique
    // constraint error (P2002) so that concurrent start requests do not 500 —
    // the record simply already exists.
    try {
      await prisma.lessonProgress.create({
        data: {
          userId,
          lessonId: lesson.id,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });
    } catch (err: any) {
      if (err?.code !== 'P2002') throw err;
    }

    // Promote a not-yet-started record to in_progress without ever downgrading
    // a lesson that is already in progress or completed.
    await prisma.lessonProgress.updateMany({
      where: {
        userId,
        lessonId: lesson.id,
        status: 'not_started',
      },
      data: { status: 'in_progress', startedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Lesson start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
