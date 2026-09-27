import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EggsProvider from '@/components/eggs/EggsProvider';
import MatrixScreen from '@/components/eggs/MatrixScreen';
import { hasLocale } from '@/lib/i18n';
import '../../eggs-pages.css';

// Easter egg route: not linked, not in the sitemap, not indexed.
export const metadata: Metadata = { title: 'webu.ge/matrix', robots: { index: false, follow: false } };

export default async function Matrix({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <EggsProvider lang={lang} overscroll={false}><MatrixScreen lang={lang} /></EggsProvider>;
}
