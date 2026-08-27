import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from '@/i18n/routing';

const protectedPaths = [
  '/dashboard',
  '/learn',
  '/lessons',
  '/review',
  '/progress',
  '/profile',
  '/onboarding',
  '/admin',
];

const authPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

function getPathnameLocale(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

function stripLocale(pathname: string, locale: string): string {
  const stripped = pathname.replace(`/${locale}`, '') || '/';
  return stripped;
}

function detectLocale(req: NextRequest): string {
  const acceptLang = req.headers.get('accept-language') ?? '';
  if (acceptLang.includes('pt')) return 'pt';
  return defaultLocale;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API, _next, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if pathname has locale prefix
  const pathnameLocale = getPathnameLocale(pathname);

  // No locale prefix → redirect to locale-prefixed path
  if (!pathnameLocale) {
    const locale = detectLocale(req);
    const newPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    return NextResponse.redirect(new URL(newPath, req.url));
  }

  const pathWithoutLocale = stripLocale(pathname, pathnameLocale);

  // Auth checks
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isProtected = protectedPaths.some((p: string) => pathWithoutLocale.startsWith(p));
  const isAuthPage = authPaths.some((p: string) => pathWithoutLocale.startsWith(p));

  // Not authenticated → trying to access protected route → login
  if (isProtected && !token) {
    const loginUrl = new URL(`/${pathnameLocale}/login`, req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → trying to access auth page → dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL(`/${pathnameLocale}/dashboard`, req.url));
  }

  if (token && isProtected) {
    // Onboarding guard: not completed → redirect to onboarding
    const onboardingCompleted = (token as any)?.onboardingCompleted;
    if (
      onboardingCompleted === false &&
      pathWithoutLocale !== '/onboarding' &&
      !pathWithoutLocale.startsWith('/admin')
    ) {
      return NextResponse.redirect(new URL(`/${pathnameLocale}/onboarding`, req.url));
    }

    // Admin guard: not admin → dashboard
    if (pathWithoutLocale.startsWith('/admin') && (token as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${pathnameLocale}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|og-image\\.png|.*\\.svg).*)'],
};
