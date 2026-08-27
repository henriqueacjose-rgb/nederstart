import { Providers } from '@/components/providers';
import { getMessages } from '@/lib/i18n';
import { isValidLocale, defaultLocale } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CookieBanner } from '@/components/cookie-banner';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isValidLocale(params?.locale) ? params.locale : defaultLocale;
  const messages = await getMessages(locale);

  return (
    <Providers locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CookieBanner />
    </Providers>
  );
}
