'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Volume2,
  BookOpen,
  Repeat,
  MapPin,
  Sparkles,
  Flame,
  Trophy,
  Star,
  Smartphone,
  Route,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const HERO_IMG =
  'https://cdn.abacus.ai/images/e9e9987d-89df-428f-a4b3-e1879dcbb7f9.png';
const REAL_IMGS = [
  'https://cdn.abacus.ai/images/753167c3-ad25-4512-a5ff-fb68df5cd77b.png',
  'https://cdn.abacus.ai/images/092a96d4-3673-4938-8dca-ace286ae2592.png',
  'https://cdn.abacus.ai/images/6a9d5f08-f2fc-4d1a-86c9-08f8f00750ee.png',
  'https://cdn.abacus.ai/images/3057acc1-d185-40c9-8766-773fafc7ec31.png',
];

export function HomeView({ locale }: { locale: string }) {
  const t = useTranslations('home');
  const tf = useTranslations('faq');

  const href = (p: string) => `/${locale}${p}`;

  const how = [
    { icon: Volume2, title: t('how1Title'), body: t('how1Body') },
    { icon: BookOpen, title: t('how2Title'), body: t('how2Body') },
    { icon: Repeat, title: t('how3Title'), body: t('how3Body') },
  ];

  const why = [
    { icon: MapPin, title: t('why1'), body: t('why1Body') },
    { icon: Volume2, title: t('why2'), body: t('why2Body') },
    { icon: Route, title: t('why3'), body: t('why3Body') },
    { icon: Smartphone, title: t('why4'), body: t('why4Body') },
  ];

  const levels = ['A0', 'A1', 'A2', 'B1', 'B2'];

  const realLife = [
    { img: REAL_IMGS[0], label: t('real1') },
    { img: REAL_IMGS[1], label: t('real2') },
    { img: REAL_IMGS[2], label: t('real3') },
    { img: REAL_IMGS[3], label: t('real4') },
  ];

  const faqs = [1, 2, 3, 4, 5].map((n) => ({
    q: tf(`q${n}` as any),
    a: tf(`a${n}` as any),
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              A0 &rarr; B2
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                href={href('/register')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
              >
                {t('heroCta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted"
              >
                {t('heroSecondary')}
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t('heroNote')}</p>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted shadow-lg">
              <Image
                src={HERO_IMG}
                alt="Illustration of a learner studying Dutch with Dutch cultural elements"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {t('howTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('howSubtitle')}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {how.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {t('whyTitle')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('whySubtitle')}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((item, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path A0 -> B2 */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {t('pathTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('pathSubtitle')}</p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {levels.map((lvl, i) => (
            <div key={lvl} className="flex items-center gap-3">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border bg-card shadow-sm">
                <span className="font-display text-lg font-bold text-primary">
                  {lvl}
                </span>
              </div>
              {i < levels.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Real life */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {t('realLifeTitle')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('realLifeSubtitle')}
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {realLife.map((item, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 280px"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Method: pronunciation done right */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 shadow-sm md:p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Volume2 className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t('methodTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">{t('methodBody')}</p>
        </div>
      </section>

      {/* Gamification */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {t('gamificationTitle')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('gamificationSubtitle')}
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {[
              { icon: Star, label: 'XP' },
              { icon: Flame, label: 'Streaks' },
              { icon: Trophy, label: 'Milestones' },
            ].map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border bg-card px-6 py-4 shadow-sm"
              >
                <g.icon className="h-6 w-6 text-accent" />
                <span className="font-semibold">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {t('pricingTitle')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('pricingSubtitle')}</p>
          <div className="mt-8">
            <Link
              href={href('/pricing')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
            >
              {t('pricingCta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {t('faqTitle')}
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center md:py-24">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t('finalCtaTitle')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('finalCtaBody')}
          </p>
          <div className="mt-8">
            <Link
              href={href('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
            >
              {t('finalCtaButton')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
