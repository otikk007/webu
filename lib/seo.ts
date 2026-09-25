import { GUIDES, PAGES, SERVICE_PAGES, UPDATED, type ContentPage } from './pages';
import { FAQS, SITE_URL, STEPS } from './site';

// Single source for machine-readable facts about Webu (JSON-LD and llms.txt).
// Only verified facts go here: no phone, address, clients or numbers until they are real.

export const BRAND = {
  name: 'Webu',
  slogan: 'თქვენი იდეა. ჩვენი გამოცდილება.',
  description: 'Webu არის ქართული ციფრული სტუდია, რომელიც ქმნის ვებსაიტებს, ონლაინ მაღაზიებს, ვებაპლიკაციებსა და მობილურ აპლიკაციებს, რომლებიც ბიზნესის მიზნებსა და საჭიროებებზეა მორგებული. პროცესს მართავს იდეიდან გაშვებამდე და გაშვების შემდეგაც უწევს მხარდაჭერას (Webu Care).',
  descriptionEn: 'Webu is a Georgian digital studio that designs and builds websites, online stores, web applications and mobile apps tailored to business goals, and supports them after launch (Webu Care).',
};

// Mirrors the services shown on the homepage.
export const SERVICES = [
  { slug: 'saitis-damzadeba', name: 'ვებსაიტები', en: 'Websites', text: 'ლენდინგები და კორპორატიული საიტები, რომლებიც ბიზნესს გასაგებად წარმოაჩენს და მომხმარებელს შემდეგ ნაბიჯამდე მიიყვანს.' },
  { slug: 'onlain-maghaziis-shekmna', name: 'ონლაინ მაღაზიები', en: 'Online stores', text: 'ონლაინ მაღაზიის შექმნა: გადახდა ქართული ბანკებით, მარაგისა და მიწოდების მართვა.' },
  { slug: 'vebaplikaciis-shekmna', name: 'ვებაპლიკაციები', en: 'Web applications', text: 'ონლაინ ჯავშნის სისტემები, კლიენტის პორტალები და შიდა ინსტრუმენტები, რომლებიც ბიზნესის პროცესზეა მორგებული.' },
  { slug: 'mobiluri-aplikaciis-shekmna', name: 'მობილური აპლიკაციები', en: 'Mobile apps', text: 'iOS და Android აპლიკაციები, დიზაინიდან App Store-სა და Google Play-ზე განთავსებამდე.' },
  { slug: '', name: 'UI და UX დიზაინი', en: 'UI/UX design', text: 'ინტერფეისები, რომლებიც მომხმარებლისთვის გასაგები და მოსახერხებელია: სტრუქტურა, პროტოტიპი და დიზაინ სისტემა.' },
  { slug: 'seo-aeo-geo', name: 'SEO, AEO და GEO', en: 'SEO, answer engine and generative engine optimization', text: 'მაღალი პოზიციები Google-ში (SEO), პირდაპირი პასუხები ძიებაში (AEO) და ხილვადობა ChatGPT-სა, Gemini-სა და Perplexity-ში (GEO). ხელმისაწვდომია ახალი საიტის ნაწილად და ცალკე სერვისად არსებული საიტისთვის.' },
  { slug: '', name: 'ბრენდინგი', en: 'Branding', text: 'ლოგო, ფერები, შრიფტები და ვიზუალური ენა.' },
  { slug: 'webu-care', name: 'Webu Care', en: 'Website support and maintenance', text: 'გაშვების შემდეგ მონიტორინგი, backup-ები, განახლებები და შეცდომების გასწორება.' },
];

const ORG_ID = `${SITE_URL}/#organization`;

export const pageHref = (p: ContentPage) => (p.kind === 'guide' ? `/blog/${p.slug}` : `/${p.slug}`);

const faqLd = (id: string, faqs: { q: string; a: string }[]) => ({
  '@type': 'FAQPage', '@id': id, inLanguage: 'ka',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// JSON-LD for a service page or guide: breadcrumbs, the page itself,
// the Service (with a starting price when there is one) or Article, and its FAQ.
export function pageJsonLd(p: ContentPage) {
  const url = `${SITE_URL}${pageHref(p)}`;
  const org = { '@type': 'Organization', '@id': ORG_ID, name: BRAND.name, url: SITE_URL, logo: `${SITE_URL}/icon.svg` };
  const main = p.kind === 'guide'
    ? {
        '@type': 'Article', '@id': `${url}#article`, headline: p.h1, description: p.description, inLanguage: 'ka',
        datePublished: UPDATED, dateModified: UPDATED, author: org, publisher: org, mainEntityOfPage: url, image: `${url}/opengraph-image`,
      }
    : {
        '@type': 'Service', '@id': `${url}#service`, name: p.nav, description: p.answer, serviceType: p.nav, url,
        provider: org, areaServed: { '@type': 'Country', name: 'Georgia' }, availableLanguage: 'ka',
        ...(p.priceValue ? { offers: { '@type': 'Offer', priceCurrency: 'GEL', price: p.priceValue, priceSpecification: { '@type': 'PriceSpecification', minPrice: p.priceValue, priceCurrency: 'GEL' }, url } } : {}),
      };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'მთავარი', item: SITE_URL },
          p.kind === 'guide'
            ? { '@type': 'ListItem', position: 2, name: 'ბლოგი', item: `${SITE_URL}/blog` }
            : { '@type': 'ListItem', position: 2, name: 'სერვისები', item: `${SITE_URL}/#services` },
          { '@type': 'ListItem', position: 3, name: p.nav, item: url },
        ],
      },
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: p.title, description: p.description, inLanguage: 'ka',
        dateModified: UPDATED, isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': ORG_ID },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.cp-answer'] },
      },
      main,
      faqLd(`${url}#faq`, p.faqs),
    ],
  };
}

export function jsonLd() {
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
        slogan: BRAND.slogan,
        description: BRAND.description,
        areaServed: { '@type': 'Country', name: 'Georgia' },
        knowsLanguage: ['ka', 'en'],
        knowsAbout: ['საიტის დამზადება', 'ვებგვერდის დამზადება', 'ონლაინ მაღაზიის შექმნა', 'ვებაპლიკაციის შექმნა', 'მობილური აპლიკაციის შექმნა', 'ვებ დიზაინი', 'UI/UX', 'SEO', 'AEO', 'GEO', 'AI search optimization', 'Web development', 'Mobile app development'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Webu სერვისები',
          itemListElement: SERVICES.map(s => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, alternateName: s.en, description: s.text, ...(s.slug ? { url: `${SITE_URL}/${s.slug}` } : {}), provider: { '@id': ORG_ID }, areaServed: { '@type': 'Country', name: 'Georgia' } },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND.name,
        inLanguage: 'ka',
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: 'Webu | საიტის დამზადება, ვებაპლიკაციები და მობილური აპლიკაციები',
        description: BRAND.description,
        inLanguage: 'ka',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': ORG_ID },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        inLanguage: 'ka',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

export function llmsTxt() {
  return [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.description}`,
    '',
    BRAND.descriptionEn,
    '',
    `სლოგანი: ${BRAND.slogan}`,
    `ენა: ქართული. მომსახურების არეალი: საქართველო.`,
    `საიტი: ${SITE_URL}`,
    '',
    '## სერვისები',
    '',
    ...SERVICES.map(s => `- **${s.name}** (${s.en}): ${s.text}`),
    '',
    '## როგორ ვმუშაობთ',
    '',
    'პრინციპი: ჯერ ვიგებთ ბიზნესს, შემდეგ ვქმნით მისთვის სწორ გადაწყვეტას. პროექტი არ იწყება მკაფიო Scope-ის გარეშე.',
    '',
    ...STEPS.map(s => `${Number(s.n)}. **${s.title}** (${s.time}): ${s.text}`),
    '',
    '## ხშირად დასმული კითხვები',
    '',
    ...FAQS.flatMap(f => [`### ${f.q}`, '', f.a, '']),
    '## სერვისების გვერდები',
    '',
    ...SERVICE_PAGES.map(p => `- [${p.nav}](${SITE_URL}${pageHref(p)}): ${p.description}`),
    '',
    '## გზამკვლევები',
    '',
    ...GUIDES.map(p => `- [${p.h1}](${SITE_URL}${pageHref(p)}): ${p.description}`),
    '',
    `სრული ტექსტი ერთ ფაილში: ${SITE_URL}/llms-full.txt`,
    '',
    '## ბმულები',
    '',
    `- [სერვისები](${SITE_URL}/#services)`,
    `- [როგორ ვმუშაობთ](${SITE_URL}/#process)`,
    `- [უფასო SEO აუდიტი](${SITE_URL}/#audit)`,
    `- [სავარაუდო ბიუჯეტის კალკულატორი](${SITE_URL}/#price)`,
    `- [კონსულტაციის დაჯავშნა](${SITE_URL}/#contact)`,
    '',
  ].join('\n');
}

// Every page's full text in one Markdown file, for AI assistants that read llms-full.txt.
export function llmsFullTxt() {
  const body = PAGES.map(p => [
    `# ${p.h1}`,
    '',
    `URL: ${SITE_URL}${pageHref(p)}`,
    `განახლებულია: ${UPDATED}`,
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
    '## ხშირად დასმული კითხვები',
    '',
    ...p.faqs.flatMap(f => [`### ${f.q}`, '', f.a, '']),
  ].join('\n'));
  return [llmsTxt(), '---', '', ...body].join('\n\n');
}
