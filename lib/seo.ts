import { getDict } from './dict';
import { LANG_META, LOCALES, lp, type Lang } from './i18n';
import { ALL_PAGES, UPDATED, guides, pageHref, servicePages, type ContentPage } from './pages';
import { SITE_URL } from './site';

// Machine-readable facts about Webu (JSON-LD and llms.txt) in every language.
// Only verified facts go here: no phone, address, clients or numbers until they are real.

export const BRAND = {
  name: 'Webu',
  slogan: { ka: 'თქვენი იდეა. ჩვენი გამოცდილება.', en: 'Your idea. Our expertise.', ru: 'Ваша идея. Наш опыт.' } as Record<Lang, string>,
  description: {
    ka: 'Webu არის ქართული ციფრული სტუდია, რომელიც ქმნის ვებსაიტებს, ონლაინ მაღაზიებს, ვებაპლიკაციებსა და მობილურ აპლიკაციებს, რომლებიც ბიზნესის მიზნებსა და საჭიროებებზეა მორგებული. პროცესს მართავს იდეიდან გაშვებამდე და გაშვების შემდეგაც უწევს მხარდაჭერას (Webu Care).',
    en: 'Webu is a digital studio in Tbilisi, Georgia that designs and builds websites, online stores, web applications and mobile apps tailored to business goals. It manages the process from idea to launch and supports products after launch (Webu Care).',
    ru: 'Webu — цифровая студия в Тбилиси, которая создаёт сайты, интернет-магазины, веб-приложения и мобильные приложения под цели бизнеса. Ведёт процесс от идеи до запуска и поддерживает продукты после запуска (Webu Care).',
  } as Record<Lang, string>,
};

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const abs = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

const faqLd = (id: string, lang: Lang, faqs: { q: string; a: string }[]) => ({
  '@type': 'FAQPage', '@id': id, inLanguage: lang,
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// The services Webu offers, in a language: one per service page.
function catalog(lang: Lang) {
  return [
    ...servicePages(lang).map(p => ({ name: p.nav, description: p.answer, url: abs(pageHref(p)) })),
  ];
}

// JSON-LD for a service page, guide or info page: breadcrumbs, the page itself,
// the Service (with a starting price when there is one), Article or AboutPage, and its FAQ.
export function pageJsonLd(p: ContentPage) {
  const t = getDict(p.lang).content;
  const url = abs(pageHref(p));
  const org = { '@type': 'Organization', '@id': ORG_ID, name: BRAND.name, url: SITE_URL, logo: `${SITE_URL}/icon.svg` };
  const main = p.kind === 'page'
    ? { '@type': 'AboutPage', '@id': `${url}#about`, name: p.h1, description: p.answer, url, about: { '@id': ORG_ID }, inLanguage: p.lang }
    : p.kind === 'guide'
    ? {
        '@type': 'Article', '@id': `${url}#article`, headline: p.h1, description: p.description, inLanguage: p.lang,
        datePublished: UPDATED, dateModified: UPDATED, author: org, publisher: org, mainEntityOfPage: url, image: `${url}/opengraph-image`,
        ...(p.sources ? { citation: p.sources.map(s => ({ '@type': 'CreativeWork', name: s.title, url: s.url })) } : {}),
      }
    : {
        '@type': 'Service', '@id': `${url}#service`, name: p.nav, description: p.answer, serviceType: p.nav, url,
        provider: org, areaServed: { '@type': 'Country', name: 'Georgia' }, availableLanguage: ['ka', 'en', 'ru'],
        ...(p.priceValue ? { offers: { '@type': 'Offer', priceCurrency: 'GEL', price: p.priceValue, priceSpecification: { '@type': 'PriceSpecification', minPrice: p.priceValue, priceCurrency: 'GEL' }, url } } : {}),
      };
  const home = abs(lp(p.lang, '/'));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t.home, item: home },
          ...(p.kind === 'page' ? [] : [p.kind === 'guide'
            ? { '@type': 'ListItem', position: 2, name: t.blog, item: abs(lp(p.lang, '/blog')) }
            : { '@type': 'ListItem', position: 2, name: t.services, item: `${home}#services` }]),
          { '@type': 'ListItem', position: p.kind === 'page' ? 2 : 3, name: p.nav, item: url },
        ],
      },
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: p.title, description: p.description, inLanguage: p.lang,
        dateModified: UPDATED, isPartOf: { '@id': WEBSITE_ID }, about: { '@id': ORG_ID },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.cp-answer'] },
      },
      main,
      faqLd(`${url}#faq`, p.lang, p.faqs),
    ],
  };
}

/** Homepage JSON-LD: the organization with its service catalog, the website, the page and its FAQ. */
export function jsonLd(lang: Lang) {
  const d = getDict(lang);
  const home = abs(lp(lang, '/'));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': ORG_ID,
        name: BRAND.name,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        image: `${SITE_URL}/assets/s-hero.jpg`,
        slogan: BRAND.slogan[lang],
        description: BRAND.description[lang],
        areaServed: { '@type': 'Country', name: 'Georgia' },
        knowsLanguage: ['ka', 'en', 'ru'],
        knowsAbout: ['საიტის დამზადება', 'ონლაინ მაღაზიის შექმნა', 'მობილური აპლიკაციის შექმნა', 'Website development', 'Web application development', 'Mobile app development', 'Разработка сайтов', 'UI/UX', 'SEO', 'AEO', 'GEO', 'AI search optimization'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: d.content.services,
          itemListElement: catalog(lang).map(s => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, description: s.description, ...('url' in s ? { url: s.url } : {}), provider: { '@id': ORG_ID }, areaServed: { '@type': 'Country', name: 'Georgia' } },
          })),
        },
      },
      { '@type': 'WebSite', '@id': WEBSITE_ID, url: SITE_URL, name: BRAND.name, inLanguage: ['ka', 'en', 'ru'], publisher: { '@id': ORG_ID } },
      { '@type': 'WebPage', '@id': `${home}#webpage`, url: home, name: d.meta.title, description: d.meta.description, inLanguage: lang, isPartOf: { '@id': WEBSITE_ID }, about: { '@id': ORG_ID } },
      faqLd(`${home}#faq`, lang, d.faq.items),
    ],
  };
}

const LLMS_HEAD: Record<Lang, { services: string; process: string; principle: string; faq: string; guides: string; links: string }> = {
  ka: { services: 'სერვისები', process: 'როგორ ვმუშაობთ', principle: 'პრინციპი: ჯერ ვიგებთ ბიზნესს, შემდეგ ვქმნით მისთვის სწორ გადაწყვეტას. პროექტი არ იწყება მკაფიო Scope-ის გარეშე.', faq: 'ხშირად დასმული კითხვები', guides: 'გზამკვლევები', links: 'ბმულები' },
  en: { services: 'Services', process: 'How we work', principle: 'Principle: first we understand the business, then we build the right solution for it. No project starts without a clear scope.', faq: 'FAQ', guides: 'Guides', links: 'Links' },
  ru: { services: 'Услуги', process: 'Как мы работаем', principle: 'Принцип: сначала разбираемся в бизнесе, затем создаём для него правильное решение. Проект не начинается без чёткого Scope.', faq: 'Частые вопросы', guides: 'Гиды', links: 'Ссылки' },
};

function llmsSection(lang: Lang, full: boolean) {
  const d = getDict(lang), h = LLMS_HEAD[lang], home = abs(lp(lang, '/'));
  return [
    `## ${LANG_META[lang].label}`,
    '',
    `> ${BRAND.description[lang]}`,
    '',
    `${BRAND.slogan[lang]} · ${home}`,
    '',
    `### ${h.services}`,
    '',
    ...catalog(lang).map(s => `- [${s.name}](${s.url}): ${s.description}`),
    '',
    `### ${h.guides}`,
    '',
    ...guides(lang).map(p => `- [${p.h1}](${abs(pageHref(p))}): ${p.description}`),
    '',
    ...(full ? [
      `### ${h.process}`,
      '',
      h.principle,
      '',
      ...d.process.steps.map(s => `${Number(s.n)}. **${s.title}** (${s.time}): ${s.text}`),
      '',
      `### ${h.faq}`,
      '',
      ...d.faq.items.flatMap(f => [`- **${f.q}** ${f.a}`]),
      '',
    ] : []),
    `### ${h.links}`,
    '',
    `- [${d.nav.items[3].label}](${home}#audit)`,
    `- [${d.price.h2}](${home}#price)`,
    `- [${d.contact.h2}](${home}#contact)`,
    '',
  ];
}

/** /llms.txt per https://llmstxt.org: an H1, a summary, then link lists, one section per language. */
export function llmsTxt() {
  return [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.description.en}`,
    '',
    `Languages: Georgian (default, ${SITE_URL}), English (${abs('/en')}), Russian (${abs('/ru')}). Service area: Georgia. Prices in GEL.`,
    `Full text of every page: ${SITE_URL}/llms-full.txt`,
    '',
    ...LOCALES.flatMap(l => llmsSection(l, l === 'ka')),
  ].join('\n');
}

// Every page's full text in one Markdown file, for AI assistants that read llms-full.txt.
export function llmsFullTxt() {
  const body = ALL_PAGES.map(p => [
    `# ${p.h1}`,
    '',
    `URL: ${abs(pageHref(p))} · ${LANG_META[p.lang].label} · ${UPDATED}`,
    '',
    p.answer,
    '',
    ...(p.facts ?? []).map(f => `- ${f.k}: ${f.v}`),
    '',
    ...p.blocks.flatMap(b => [
      `## ${b.h2}`,
      '',
      ...(b.p ?? []).flatMap(t => [t, '']),
      ...(b.table ? [`| ${b.table.head.join(' | ')} |`, `| ${b.table.head.map(() => '---').join(' | ')} |`, ...b.table.rows.map(r => `| ${r.join(' | ')} |`), ''] : []),
      ...(b.list ? [...b.list.map(t => `- ${t}`), ''] : []),
    ]),
    `## ${getDict(p.lang).content.faq}`,
    '',
    ...p.faqs.flatMap(f => [`### ${f.q}`, '', f.a, '']),
  ].join('\n'));
  return [llmsTxt(), '---', '', ...body].join('\n\n');
}

/** hreflang map for Next metadata: { ka: '/x', en: '/en/y', 'x-default': '/x' }. */
export function languageAlternates(paths: Partial<Record<Lang, string>>) {
  const out: Record<string, string> = {};
  for (const l of LOCALES) if (paths[l]) out[LANG_META[l].hreflang] = paths[l]!;
  if (paths.ka) out['x-default'] = paths.ka;
  return out;
}
