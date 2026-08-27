export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getProgressData } from '@/lib/progress';
import { ProgressView } from './_components/progress-view';

export default async function ProgressPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  const data = await getProgressData(session.user.id, params.locale);

  return <ProgressView data={data} />;
}
