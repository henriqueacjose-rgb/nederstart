export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  getAdminStats,
  getContentTree,
  getAdminUsers,
} from '@/lib/admin';
import { AdminDashboard } from './_components/admin-dashboard';

export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }
  if (session.user.role !== 'admin') {
    redirect(`/${params.locale}/dashboard`);
  }

  const [stats, content, users] = await Promise.all([
    getAdminStats(),
    getContentTree(params.locale),
    getAdminUsers(),
  ]);

  return (
    <AdminDashboard
      locale={params.locale}
      stats={stats}
      content={content}
      users={users}
    />
  );
}
