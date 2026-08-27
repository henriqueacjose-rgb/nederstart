import { ForgotPasswordForm } from './_components/forgot-password-form';

export default function ForgotPasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  return <ForgotPasswordForm locale={params?.locale ?? 'en'} />;
}
