// Languages. Georgian is the default and lives at the root (no prefix),
// so existing URLs keep working; English and Russian live under /en and /ru.

export const LOCALES = ['ka', 'en', 'ru'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'ka';

export const hasLocale = (l: string): l is Lang => (LOCALES as readonly string[]).includes(l);

/** Public URL path for a language: lp('en', '/#audit') -> '/en/#audit', lp('ka', '/x') -> '/x'. */
export function lp(lang: Lang, path = '/') {
  if (lang === DEFAULT_LANG) return path;
  if (path === '/') return `/${lang}`;
  return path.startsWith('/#') ? `/${lang}${path}` : `/${lang}${path}`;
}

export const LANG_META: Record<Lang, { label: string; short: string; og: string; hreflang: string }> = {
  ka: { label: 'ქართული', short: 'KA', og: 'ka_GE', hreflang: 'ka' },
  en: { label: 'English', short: 'EN', og: 'en_US', hreflang: 'en' },
  ru: { label: 'Русский', short: 'RU', og: 'ru_RU', hreflang: 'ru' },
};

/** Fills {name} placeholders: fill('{n} weeks', { n: 4 }). */
export const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
