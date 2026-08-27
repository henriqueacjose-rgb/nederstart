'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  RefreshCw,
  User,
  Tag,
} from 'lucide-react';

function getLocaleFromPath(pathname: string): string {
  const match = pathname?.match?.(/^\/(en|pt)/);
  return match?.[1] ?? 'en';
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname ?? '');
  const { data: session, status } = useSession() || {};
  const t = useTranslations('nav');

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const otherLocale = locale === 'en' ? 'pt' : 'en';
  const switchLocaleHref = (pathname ?? '').replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Neder<span className="text-primary">Start</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/dashboard`}>
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  {t('dashboard')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/learn`}>
                  <GraduationCap className="mr-1.5 h-4 w-4" />
                  {t('learn')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/review`}>
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  {t('review')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/progress`}>
                  <BarChart3 className="mr-1.5 h-4 w-4" />
                  {t('progress')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/profile`}>
                  <User className="mr-1.5 h-4 w-4" />
                  {t('profile')}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut?.({ callbackUrl: `/${locale}/login` })}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                {t('logout')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/pricing`}>
                  <Tag className="mr-1.5 h-4 w-4" />
                  {t('pricing')}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/login`}>{t('login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/${locale}/register`}>{t('register')}</Link>
              </Button>
            </>
          )}

          {/* Locale switcher */}
          <Button variant="outline" size="sm" asChild>
            <Link href={switchLocaleHref}>
              {otherLocale.toUpperCase()}
            </Link>
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t('dashboard')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href={`/${locale}/learn`} onClick={() => setMobileOpen(false)}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {t('learn')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href={`/${locale}/review`} onClick={() => setMobileOpen(false)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('review')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href={`/${locale}/progress`} onClick={() => setMobileOpen(false)}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t('progress')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href={`/${locale}/profile`} onClick={() => setMobileOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut?.({ callbackUrl: `/${locale}/login` });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link href={`/${locale}/pricing`} onClick={() => setMobileOpen(false)}>
                    <Tag className="mr-2 h-4 w-4" />
                    {t('pricing')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('login')}
                  </Link>
                </Button>
                <Button size="sm" className="justify-start" asChild>
                  <Link
                    href={`/${locale}/register`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="justify-start" asChild>
              <Link
                href={switchLocaleHref}
                onClick={() => setMobileOpen(false)}
              >
                {otherLocale === 'pt' ? '🇧🇷 Português' : '🇬🇧 English'}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
