export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ProfileView } from './_components/profile-view';

export default async function ProfilePage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      displayName: true,
      uiLocale: true,
      learningGoal: true,
      studyFrequency: true,
      plan: true,
    },
  });

  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  return (
    <ProfileView
      locale={params.locale}
      user={{
        email: user.email,
        displayName: user.displayName ?? '',
        uiLocale: user.uiLocale ?? 'en',
        learningGoal: user.learningGoal ?? '',
        studyFrequency: user.studyFrequency ?? 15,
        plan: user.plan ?? 'free',
      }}
    />
  );
}
