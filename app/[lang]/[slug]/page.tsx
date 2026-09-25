import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPageView from '@/components/ContentPage';
import { LANG_META, LOCALES, hasLocale } from '@/lib/i18n';
import { UPDATED, alternates, pageBySlug, pageHref, pagesFor } from '@/lib/pages';
import { languageAlternates } from '@/lib/seo';

export const dynamicParams = false;

// Service pages and info pages; guides live under /blog.
export function generateStaticParams({ params }: { params: { lang: string } }) {
  const langs = params?.lang && hasLocale(params.lang) ? [params.lang] : LOCALES;
  return langs.flatMap(lang => pagesFor(lang).filter(p => p.kind !== 'guide').map(p => ({ lang, slug: p.slug })));
}

async function load(params: Promise<{ lang: string; slug: string }>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return null;
  const p = pageBySlug(lang, slug);
  return p && p.kind !== 'guide' ? p : null;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const p = await load(params);
  if (!p) return {};
  const url = pageHref(p);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url, languages: languageAlternates(alternates(p)) },
    openGraph: { type: 'website', locale: LANG_META[p.lang].og, siteName: 'Webu', url, title: p.title, description: p.description },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const p = await load(params);
  if (!p) notFound();
  return <ContentPageView page={p} updated={UPDATED} />;
}
