import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

function getBaseUrl(): string {
  const h = headers();
  const host =
    h.get('x-forwarded-host') ?? h.get('host') ?? undefined;
  const proto = h.get('x-forwarded-proto') ?? 'https';
  if (host) return `${proto}://${host}`;
  return process.env.NEXTAUTH_URL ?? 'https://nederstart.abacusai.app';
}

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/en/admin', '/pt/admin'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
