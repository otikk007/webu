// Service pages, guides and info pages in every language.
// Content is written from WEBU_PRINCIPLES.md and the prices/timelines Otar approved;
// no invented clients, statistics or guarantees. One source feeds the pages,
// their JSON-LD, the sitemap (with hreflang) and llms-full.txt.

import { DEFAULT_LANG, LOCALES, lp, type Lang } from './i18n';
import { PAGES_EN } from './pages.en';
import { PAGES_KA } from './pages.ka';
import { PAGES_RU } from './pages.ru';

export const UPDATED = '2026-09-25';

export type Block = { h2: string; p?: string[]; list?: string[]; table?: { head: string[]; rows: string[][] } };
export type QA = { q: string; a: string };

export type RawPage = {
  id?: string;                 // shared across languages; Georgian pages derive it from the slug
  slug: string;
  kind: 'service' | 'guide' | 'page';
  nav: string;                 // short name for links and breadcrumbs
  title: string;               // <title>
  description: string;         // meta description
  h1: string;
  answer: string;              // answer-first summary: the passage AI engines quote
  facts?: { k: string; v: string }[];
  blocks: Block[];
  faqs: QA[];
  price?: string;              // "from" price shown in the facts box and Offer schema
  priceValue?: number;
  cta: string;
  related: string[];           // ids (Georgian file: slugs)
  sources?: { title: string; url: string }[];  // primary sources cited by a guide
};

export type ContentPage = RawPage & { id: string; lang: Lang };

// Georgian slug -> language-independent id.
const KA_IDS: Record<string, string> = {
  'saitis-damzadeba': 'website',
  'onlain-maghaziis-shekmna': 'store',
  'vebaplikaciis-shekmna': 'webapp',
  'mobiluri-aplikaciis-shekmna': 'mobile',
  'seo-aeo-geo': 'seo',
  'webu-care': 'care',
  'dizaini-da-brendingi': 'design',
  'reklama-da-analitika': 'growth',
  'ai-da-avtomatizacia': 'ai',
  'hostingi-da-infrastruktura': 'hosting',
  'chven-shesakheb': 'about',
  'konfidencialurobis-politika': 'privacy',
  'saitis-damzadebis-fasi': 'cost',
  'ra-aris-geo': 'geo',
  'core-web-vitals': 'cwv',
  'landingi-tu-korporaciuli-saiti': 'landing',
  'rogor-avirchiot-veb-studia': 'studio',
};

const BY_LANG: Record<Lang, ContentPage[]> = {
  ka: PAGES_KA.map(p => ({ ...p, id: KA_IDS[p.slug], lang: 'ka' as const, related: p.related.map(s => KA_IDS[s] ?? s) })),
  en: PAGES_EN.map(p => ({ ...p, id: p.id!, lang: 'en' as const })),
  ru: PAGES_RU.map(p => ({ ...p, id: p.id!, lang: 'ru' as const })),
};

export const pagesFor = (lang: Lang) => BY_LANG[lang];
export const servicePages = (lang: Lang) => BY_LANG[lang].filter(p => p.kind === 'service');
export const guides = (lang: Lang) => BY_LANG[lang].filter(p => p.kind === 'guide');
export const infoPages = (lang: Lang) => BY_LANG[lang].filter(p => p.kind === 'page');
export const pageBySlug = (lang: Lang, slug: string) => BY_LANG[lang].find(p => p.slug === slug);
export const pageById = (lang: Lang, id: string) => BY_LANG[lang].find(p => p.id === id);

/** Public path of a page: /saitis-damzadeba, /en/website-development, /ru/blog/stoimost-sajta. */
export const pageHref = (p: ContentPage) => lp(p.lang, p.kind === 'guide' ? `/blog/${p.slug}` : `/${p.slug}`);

/** The same page in every language that has it, for hreflang and the language switcher. */
export function alternates(p: ContentPage): Partial<Record<Lang, string>> {
  const out: Partial<Record<Lang, string>> = {};
  for (const l of LOCALES) {
    const q = pageById(l, p.id);
    if (q) out[l] = pageHref(q);
  }
  return out;
}

export const ALL_PAGES = LOCALES.flatMap(l => BY_LANG[l]);
export { DEFAULT_LANG };
