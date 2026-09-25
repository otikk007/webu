import { SERVICE_PAGES, pageBySlug } from '@/lib/pages';
import { OG_SIZE, ogImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Webu';

export function generateStaticParams() {
  return SERVICE_PAGES.map(p => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = pageBySlug((await params).slug);
  return ogImage(p?.h1 ?? 'Webu', p?.price ? `სერვისი · ${p.price}` : 'სერვისი');
}
