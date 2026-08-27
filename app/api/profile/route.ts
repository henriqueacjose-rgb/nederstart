export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));

    const data: Record<string, unknown> = {};
    if (typeof body.displayName === 'string') {
      data.displayName = body.displayName.trim().slice(0, 80);
    }
    if (body.uiLocale === 'en' || body.uiLocale === 'pt') {
      data.uiLocale = body.uiLocale;
    }
    if (typeof body.learningGoal === 'string') {
      data.learningGoal = body.learningGoal.slice(0, 200);
    }
    if (body.studyFrequency != null && !Number.isNaN(Number(body.studyFrequency))) {
      data.studyFrequency = Math.max(5, Math.min(120, Number(body.studyFrequency)));
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        displayName: true,
        uiLocale: true,
        learningGoal: true,
        studyFrequency: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Account delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
