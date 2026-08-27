export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getCourseMap } from '@/lib/course';
import { CourseMap } from './_components/course-map';

export default async function LearnPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? 'en';
  const session = await getServerSession(authOptions);
  const levels = await getCourseMap(locale, session?.user?.id);

  return <CourseMap locale={locale} levels={levels} />;
}
