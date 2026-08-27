'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanCode = 'free' | 'plus' | 'pro';

const PRICES: Record<PlanCode, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  plus: { monthly: 9.99, yearly: 89.99 },
  pro: { monthly: 19.99, yearly: 179.99 },
};

export function PricingView({ locale }: { locale: string }) {
  const t = useTranslations('pricing');
  const [yearly, setYearly] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'pt' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);

  const plans: {
    code: PlanCode;
    popular?: boolean;
  }[] = [{ code: 'free' }, { code: 'plus', popular: true }, { code: 'pro' }];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setYearly(false)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            !yearly
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t('monthly')}
        </button>
        <button
          type="button"
          onClick={() => setYearly(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            yearly
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t('yearly')}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              yearly ? 'bg-white/20' : 'bg-accent/10 text-accent'
            )}
          >
            {t('yearlySave')}
          </span>
        </button>
      </div>

      {/* Plans */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map(({ code, popular }) => {
          const price = yearly ? PRICES[code].yearly : PRICES[code].monthly;
          const features = t.raw(`${code}.features`) as string[];
          return (
            <div
              key={code}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm',
                popular && 'border-primary shadow-md ring-1 ring-primary'
              )}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('mostPopular')}
                </span>
              )}
              <h2 className="font-display text-xl font-bold">
                {t(`${code}.name`)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`${code}.tagline`)}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">
                  {fmt(price)}
                </span>
                {code !== 'free' && (
                  <span className="text-sm text-muted-foreground">
                    {yearly ? t('perYear') : t('perMonth')}
                  </span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/register`}
                className={cn(
                  'mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-all',
                  popular
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'border bg-white text-foreground hover:bg-muted'
                )}
              >
                {t('cta')}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Billing-not-enabled note */}
      <p className="mx-auto mt-10 max-w-xl rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
        {t('note')}
      </p>
    </div>
  );
}
