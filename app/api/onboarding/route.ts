export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const VALID_GOALS = [
  'work',
  'living',
  'study',
  'relationship',
  'travel',
  'integration',
  'personal',
];
const VALID_LOCALES = ['en', 'pt'];
const VALID_FREQUENCIES = [5, 10, 15, 30];

// Self-assessment -> starting level. Only A0 content is published today,
// so everyone effectively starts at A0, but we store their self-assessment level.
const LEVEL_MAP: Record<string, string> = {
  none: 'A0',
  beginner: 'A0',
  basic: 'A1',
  intermediate: 'A2',
  advanced: 'B1',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { learningGoal, uiLocale, level, studyFrequency } = body ?? {};

    if (!VALID_GOALS.includes(learningGoal)) {
      return NextResponse.json({ error: 'Invalid goal' }, { status: 400 });
    }
    if (!VALID_LOCALES.includes(uiLocale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }
    const freq = Number(studyFrequency);
    if (!VALID_FREQUENCIES.includes(freq)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }
    const startingLevel = LEVEL_MAP[level] ?? 'A0';

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        learningGoal,
        uiLocale,
        studyFrequency: freq,
        startingLevel,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ ok: true, uiLocale }, { status: 200 });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
