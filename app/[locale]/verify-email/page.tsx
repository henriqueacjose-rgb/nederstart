import { VerifyEmailContent } from './_components/verify-email-content';

export default function VerifyEmailPage({
  params,
}: {
  params: { locale: string };
}) {
  return <VerifyEmailContent locale={params?.locale ?? 'en'} />;
}
