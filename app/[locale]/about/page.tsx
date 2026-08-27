import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getMessages, getNestedValue } from '@/lib/i18n';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata(params.locale, {
    titleKey: 'about.title',
    descriptionKey: 'about.intro',
    path: '/about',
  });
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params?.locale ?? 'en';
  const m = await getMessages(locale);
  const g = (k: string) => getNestedValue(m, `about.${k}`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <h1 className="font-display text-4xl font-bold tracking-tight">
        {g('title')}
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">{g('intro')}</p>
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">
          {g('missionTitle')}
        </h2>
        <p className="mt-3 text-muted-foreground">{g('missionBody')}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-semibold">
          {g('makerTitle')}
        </h2>
        <p className="mt-3 text-muted-foreground">{g('makerBody')}</p>
      </section>
    </div>
  );
}
