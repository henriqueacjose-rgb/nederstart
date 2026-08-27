import type { Locale } from '@/i18n/routing';

const dictionaries: Record<string, () => Promise<Record<string, any>>> = {
  en: () => import('@/messages/en.json').then((m: any) => m?.default ?? m),
  pt: () => import('@/messages/pt.json').then((m: any) => m?.default ?? m),
};

export async function getMessages(locale: string): Promise<Record<string, any>> {
  const loader = dictionaries[locale] ?? dictionaries.en;
  try {
    return await loader();
  } catch {
    return await dictionaries.en();
  }
}

export function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    current = current?.[key];
    if (current === undefined) return path;
  }
  return typeof current === 'string' ? current : path;
}
