export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getReviewWords } from '@/lib/review';
import { ReviewSession } from './_components/review-session';

export default async function ReviewPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/${params.locale}/login`);
  }

  const words = await getReviewWords(session.user.id, params.locale);

  return <ReviewSession locale={params.locale} words={words} />;
}
