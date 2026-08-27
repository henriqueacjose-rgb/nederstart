export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const type = String(body?.type ?? '');
    const id = Number(body?.id);
    const isPublished = Boolean(body?.isPublished);
    if (!id || !['level', 'module', 'lesson'].includes(type)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    if (type === 'level') {
      await prisma.level.update({ where: { id }, data: { isPublished } });
    } else if (type === 'module') {
      await prisma.module.update({ where: { id }, data: { isPublished } });
    } else {
      await prisma.lesson.update({ where: { id }, data: { isPublished } });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
