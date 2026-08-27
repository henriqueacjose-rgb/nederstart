export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDashboardData } from '@/lib/dashboard';
import { DashboardView } from './_components/dashboard-view';

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  const data = await getDashboardData(session.user.id, params.locale);

  return <DashboardView locale={params.locale} data={data} />;
}
