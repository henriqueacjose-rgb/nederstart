import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getMessages, getNestedValue } from '@/lib/i18n';
import { LegalPage } from '@/components/layout/legal-page';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata(params.locale, {
    titleKey: 'privacy.title',
    descriptionKey: 'privacy.intro',
    path: '/privacy',
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? 'en';
  const m = await getMessages(locale);
  const g = (k: string) => getNestedValue(m, `privacy.${k}`);
  return (
    <LegalPage
      title={g('title')}
      updated={g('updated')}
      intro={g('intro')}
      sections={[1, 2, 3, 4, 5].map((n) => ({
        title: g(`s${n}Title`),
        body: g(`s${n}Body`),
      }))}
    />
  );
}
