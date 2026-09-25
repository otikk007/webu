import { LOCALES, hasLocale } from '@/lib/i18n';
import { OG_SIZE, ogImage } from '@/lib/og';
import { pageBySlug, pagesFor } from '@/lib/pages';
import { getDict } from '@/lib/dict';
import { BRAND } from '@/lib/seo';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Webu';

export function generateStaticParams({ params }: { params: { lang: string } }) {
  const langs = params?.lang && hasLocale(params.lang) ? [params.lang] : LOCALES;
  return langs.flatMap(lang => pagesFor(lang).filter(p => p.kind !== 'guide').map(p => ({ lang, slug: p.slug })));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = hasLocale(lang) ? lang : 'ka';
  const p = pageBySlug(l, slug);
  const kicker = p?.kind === 'page' ? 'Webu' : `${getDict(l).content.service}${p?.price ? ` · ${p.price}` : ''}`;
  return ogImage(p?.h1 ?? 'Webu', kicker, BRAND.slogan[l]);
}
