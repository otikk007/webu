import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { getDict } from '@/lib/dict';
import { fontClasses } from '@/lib/fonts';
import { LANG_META, LOCALES, hasLocale, lp } from '@/lib/i18n';
import { languageAlternates } from '@/lib/seo';
import { IS_STAGING, SITE_URL } from '@/lib/site';
import '../globals.css';
import '../eggs.css';
import '../scrollbar.css';

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { title, description } = getDict(lang).meta;
  const url = lp(lang, '/');
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    // favicon.ico (16/32/48 px) for browsers and Google results that still ask for it,
    // the SVG for the rest, and an opaque square for iOS home screens.
    icons: { icon: [{ url: '/favicon.ico', sizes: '48x48' }, { url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-touch-icon.png' },
    alternates: { canonical: url, languages: languageAlternates({ ka: '/', en: '/en', ru: '/ru' }) },
    openGraph: { type: 'website', locale: LANG_META[lang].og, alternateLocale: LOCALES.filter(l => l !== lang).map(l => LANG_META[l].og), url, siteName: 'Webu', title, description, images: [{ url: '/assets/s-hero.jpg' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/assets/s-hero.jpg'] },
    // Ownership checks for Google Search Console, Bing Webmaster Tools and Yandex Webmaster (.env.local).
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
    },
    robots: IS_STAGING ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: '#0E0F12', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
