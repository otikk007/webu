import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPageView from '@/components/ContentPage';
import { INFO_PAGES, SERVICE_PAGES, UPDATED, pageBySlug } from '@/lib/pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return [...SERVICE_PAGES, ...INFO_PAGES].map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = pageBySlug((await params).slug);
  if (!p || p.kind === 'guide') return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/${p.slug}` },
    openGraph: { type: 'website', locale: 'ka_GE', siteName: 'Webu', url: `/${p.slug}`, title: p.title, description: p.description },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = pageBySlug((await params).slug);
  if (!p || p.kind === 'guide') notFound();
  return <ContentPageView page={p} updated={UPDATED} />;
}
