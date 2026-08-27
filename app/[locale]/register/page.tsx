import { RegisterForm } from './_components/register-form';

export default function RegisterPage({
  params,
}: {
  params: { locale: string };
}) {
  return <RegisterForm locale={params?.locale ?? 'en'} />;
}
