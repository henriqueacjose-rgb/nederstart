'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type ResetValues = z.infer<typeof schema>;

export function ResetPasswordForm({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const t = useTranslations('auth.resetPassword');

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResetValues) => {
    if (!token) {
      setError(t('errors.invalidToken'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body?.error === 'invalidToken') {
          setError(t('errors.invalidToken'));
        } else {
          setError(t('errors.generic'));
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title={t('title')}>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-sm text-muted-foreground">{t('success')}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('goToLogin')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder={t('passwordPlaceholder')}
              className="pl-10"
              {...register('password')}
            />
          </div>
          {formErrors?.password && (
            <p className="text-xs text-destructive">{formErrors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              className="pl-10"
              {...register('confirmPassword')}
            />
          </div>
          {formErrors?.confirmPassword && (
            <p className="text-xs text-destructive">
              {formErrors.confirmPassword.message === 'passwordMismatch'
                ? t('errors.passwordMismatch')
                : formErrors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t('submit')}
        </Button>

        <div className="text-center">
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('goToLogin')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
