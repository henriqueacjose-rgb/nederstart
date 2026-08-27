'use client';

import { useTranslations } from 'next-intl';
import { ClipboardList, Sparkles } from 'lucide-react';

export function OnboardingPlaceholder({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <ClipboardList className="h-8 w-8 text-accent" />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('title')}
        </h1>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <p>{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
}
