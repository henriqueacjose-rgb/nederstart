'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Mail, ArrowLeft } from 'lucide-react';

export function VerifyEmailContent({ locale }: { locale: string }) {
  const t = useTranslations('auth.verifyEmail');

  return (
    <AuthLayout title={t('title')}>
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
        <p className="text-xs text-muted-foreground">{t('checkSpam')}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}
