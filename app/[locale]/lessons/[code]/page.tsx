export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getLessonByCode } from '@/lib/lesson';
import { LessonEngine } from './_components/lesson-engine';

export default async function LessonPage({
  params,
}: {
  params: { locale: string; code: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  const lesson = await getLessonByCode(
    params.code,
    params.locale,
    session.user.id
  );

  if (!lesson) {
    notFound();
  }

  if (lesson.locked) {
    redirect(`/${params.locale}/learn`);
  }

  return <LessonEngine locale={params.locale} lesson={lesson} />;
}
