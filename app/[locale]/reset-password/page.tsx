import { ResetPasswordForm } from './_components/reset-password-form';

export default function ResetPasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  return <ResetPasswordForm locale={params?.locale ?? 'en'} />;
}
