import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EggsProvider from '@/components/eggs/EggsProvider';
import VaultScreen from '@/components/eggs/VaultScreen';
import { hasLocale } from '@/lib/i18n';
import '../../eggs-pages.css';

// Easter egg route: not linked, not in the sitemap, not indexed.
export const metadata: Metadata = { title: 'webu.ge/secret', robots: { index: false, follow: false } };

export default async function Secret({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <EggsProvider lang={lang} overscroll={false}><VaultScreen lang={lang} /></EggsProvider>;
}
