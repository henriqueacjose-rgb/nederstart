import { OnboardingWizard } from './_components/onboarding-wizard';

export default function OnboardingPage({
  params,
}: {
  params: { locale: string };
}) {
  return <OnboardingWizard locale={params?.locale ?? 'en'} />;
}
