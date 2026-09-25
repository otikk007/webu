import { getDict } from '@/lib/dict';
import { LOCALES, hasLocale } from '@/lib/i18n';
import { OG_SIZE, ogImage } from '@/lib/og';
import { guides, pageBySlug } from '@/lib/pages';
import { BRAND } from '@/lib/seo';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Webu';

export function generateStaticParams({ params }: { params: { lang: string } }) {
  const langs = params?.lang && hasLocale(params.lang) ? [params.lang] : LOCALES;
  return langs.flatMap(lang => guides(lang).map(p => ({ lang, slug: p.slug })));
}

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const l = hasLocale(lang) ? lang : 'ka';
  return ogImage(pageBySlug(l, slug)?.h1 ?? 'Webu', getDict(l).content.guide, BRAND.slogan[l]);
}
