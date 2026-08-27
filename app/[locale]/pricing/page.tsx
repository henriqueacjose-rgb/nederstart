import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PricingView } from './_components/pricing-view';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return buildMetadata(params.locale, {
    titleKey: 'pricing.title',
    descriptionKey: 'pricing.subtitle',
    path: '/pricing',
  });
}

export default function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  return <PricingView locale={params?.locale ?? 'en'} />;
}
