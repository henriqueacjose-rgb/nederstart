import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { HomeView } from './_components/home-view';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata(params.locale, {
    titleKey: 'home.heroTitle',
    descriptionKey: 'home.heroSubtitle',
    path: '',
  });
}

export default function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? 'en';
  return <HomeView locale={locale} />;
}
