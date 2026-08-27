import type { Metadata } from 'next';
import { getMessages, getNestedValue } from '@/lib/i18n';

const SITE_NAME = 'NederStart';

/**
 * Build localized page metadata from an i18n key for the title and description.
 * Falls back gracefully when keys are missing.
 */
export async function buildMetadata(
  locale: string,
  opts: {
    titleKey?: string;
    descriptionKey?: string;
    title?: string;
    description?: string;
    path?: string;
  }
): Promise<Metadata> {
  const messages = await getMessages(locale);

  const rawTitle =
    opts.title ??
    (opts.titleKey ? getNestedValue(messages, opts.titleKey) : undefined);
  const description =
    opts.description ??
    (opts.descriptionKey
      ? getNestedValue(messages, opts.descriptionKey)
      : undefined);

  const title = rawTitle ? `${rawTitle} • ${SITE_NAME}` : SITE_NAME;

  const path = opts.path ?? '';
  const canonical = `/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `/en${path}`,
        pt: `/pt${path}`,
      },
    },
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: locale === 'pt' ? 'pt_PT' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
