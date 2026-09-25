import type { MetadataRoute } from 'next';
import { LOCALES, lp, type Lang } from '@/lib/i18n';
import { ALL_PAGES, UPDATED, alternates, pageHref } from '@/lib/pages';
import { languageAlternates } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;
const absAll = (paths: Partial<Record<Lang, string>>) =>
  Object.fromEntries(Object.entries(languageAlternates(paths)).map(([k, v]) => [k, abs(v)]));

// Every page in every language, each listing its translations (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(UPDATED);
  const PRIORITY = { service: 0.9, guide: 0.8, page: 0.7 } as const;
  const home = Object.fromEntries(LOCALES.map(l => [l, lp(l, '/')])) as Record<Lang, string>;
  const blog = Object.fromEntries(LOCALES.map(l => [l, lp(l, '/blog')])) as Record<Lang, string>;
  return [
    ...LOCALES.map(l => ({ url: abs(home[l]), lastModified, changeFrequency: 'weekly' as const, priority: l === 'ka' ? 1 : 0.9, alternates: { languages: absAll(home) } })),
    ...ALL_PAGES.map(p => ({ url: abs(pageHref(p)), lastModified, changeFrequency: 'monthly' as const, priority: PRIORITY[p.kind], alternates: { languages: absAll(alternates(p)) } })),
    ...LOCALES.map(l => ({ url: abs(blog[l]), lastModified, changeFrequency: 'weekly' as const, priority: 0.6, alternates: { languages: absAll(blog) } })),
  ];
}
