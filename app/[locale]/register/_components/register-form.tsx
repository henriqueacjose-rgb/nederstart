'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

const registerSchema = z
  .object({
    displayName: z.string().min(1, 'Required'),
    email: z.string().min(1).email(),
    password: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({ locale }: { locale: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('auth.register');

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body?.error === 'emailExists') {
          setError(t('errors.emailExists'));
        } else {
          setError(t('errors.generic'));
        }
        return;
      }

      // Auto-login after signup
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but auto-login failed, redirect to login
        router.replace(`/${locale}/login`);
      } else {
        router.replace(`/${locale}/dashboard`);
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="displayName">{t('displayName')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="displayName"
              placeholder={t('displayNamePlaceholder')}
              className="pl-10"
              {...register('displayName')}
            />
          </div>
          {formErrors?.displayName && (
            <p className="text-xs text-destructive">
              {formErrors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              className="pl-10"
              {...register('email')}
            />
          </div>
          {formErrors?.email && (
            <p className="text-xs text-destructive">{formErrors.email.message}</p>
          )}
        </div>

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
            <p className="text-xs text-destructive">
              {formErrors.password.message}
            </p>
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
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t('submit')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="font-medium text-primary hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
