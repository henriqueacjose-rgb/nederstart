import { LoginForm } from './_components/login-form';

export default function LoginPage({
  params,
}: {
  params: { locale: string };
}) {
  return <LoginForm locale={params?.locale ?? 'en'} />;
}
