import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPageView from '@/components/ContentPage';
import { GUIDES, UPDATED, pageBySlug } from '@/lib/pages';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = pageBySlug((await params).slug);
  if (!p || p.kind !== 'guide') return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: 'article', locale: 'ka_GE', siteName: 'Webu', url: `/blog/${p.slug}`, title: p.title, description: p.description, modifiedTime: UPDATED, publishedTime: UPDATED },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const p = pageBySlug((await params).slug);
  if (!p || p.kind !== 'guide') notFound();
  return <ContentPageView page={p} updated={UPDATED} />;
}
