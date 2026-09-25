import type { MetadataRoute } from 'next';
import { GUIDES, SERVICE_PAGES, UPDATED } from '@/lib/pages';
import { pageHref } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(UPDATED);
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    ...SERVICE_PAGES.map(p => ({ url: `${SITE_URL}${pageHref(p)}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.9 })),
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    ...GUIDES.map(p => ({ url: `${SITE_URL}${pageHref(p)}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
