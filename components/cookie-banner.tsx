'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'nederstart-cookie-consent';

function getLocaleFromPath(pathname: string): string {
  const match = pathname?.match?.(/^\/(en|pt)/);
  return match?.[1] ?? 'en';
}

export function CookieBanner() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname ?? '');
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // ignore storage access errors
    }
  }, []);

  const decide = (choice: 'accepted' | 'declined') => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore storage access errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border bg-card p-5 shadow-lg sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('message')}{' '}
            <Link
              href={`/${locale}/privacy`}
              className="font-medium text-primary hover:underline"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide('declined')}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t('decline')}
          </button>
          <button
            type="button"
            onClick={() => decide('accepted')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
