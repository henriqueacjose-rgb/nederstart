'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';

function getLocaleFromPath(pathname: string): string {
  const match = pathname?.match?.(/^\/(en|pt)/);
  return match?.[1] ?? 'en';
}

export function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname ?? '');
  const t = useTranslations('footer');
  const year = 2026;

  const href = (p: string) => `/${locale}${p}`;

  const columns = [
    {
      title: t('product'),
      links: [
        { label: t('learn'), href: href('/learn') },
        { label: t('pricing'), href: href('/pricing') },
      ],
    },
    {
      title: t('company'),
      links: [{ label: t('about'), href: href('/about') }],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: href('/privacy') },
        { label: t('terms'), href: href('/terms') },
      ],
    },
  ];

  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">
                Neder<span className="text-primary">Start</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Henrique Digital Solutions. {t('rights')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('madeBy').split('Henrique Digital Solutions')[0]}
            <a
              href="https://www.henriquedigitalsolutions.com/en"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Henrique Digital Solutions
            </a>
            {t('madeBy').split('Henrique Digital Solutions')[1]}
          </p>
        </div>
      </div>
    </footer>
  );
}
