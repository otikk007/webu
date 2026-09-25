import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { getDict } from '@/lib/dict';
import { fontClasses } from '@/lib/fonts';
import { LANG_META, LOCALES, hasLocale, lp } from '@/lib/i18n';
import { languageAlternates } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import '../globals.css';

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
    icons: { icon: '/icon.svg' },
    alternates: { canonical: url, languages: languageAlternates({ ka: '/', en: '/en', ru: '/ru' }) },
    openGraph: { type: 'website', locale: LANG_META[lang].og, alternateLocale: LOCALES.filter(l => l !== lang).map(l => LANG_META[l].og), url, siteName: 'Webu', title, description, images: [{ url: '/assets/s-hero.jpg' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/assets/s-hero.jpg'] },
    robots: { index: true, follow: true },
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
