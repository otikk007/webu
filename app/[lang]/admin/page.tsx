import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdminJoke from '@/components/eggs/AdminJoke';
import EggsProvider from '@/components/eggs/EggsProvider';
import { hasLocale } from '@/lib/i18n';
import '../../eggs-pages.css';

// A joke page for people probing /admin. It is fake: no auth, no API, nothing is sent.
// The real admin panel lives elsewhere (lib/admin-auth ADMIN_PATH).
export const metadata: Metadata = { title: 'webu admin', robots: { index: false, follow: false } };

export default async function FakeAdmin({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <EggsProvider lang={lang} overscroll={false}><AdminJoke lang={lang} /></EggsProvider>;
}
