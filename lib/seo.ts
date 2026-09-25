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
  { name: 'ვებსაიტები', en: 'Websites', text: 'ლენდინგები და კორპორატიული საიტები, რომლებიც ბიზნესს გასაგებად წარმოაჩენს და მომხმარებელს შემდეგ ნაბიჯამდე მიიყვანს.' },
  { name: 'ონლაინ მაღაზიები', en: 'Online stores', text: 'ონლაინ მაღაზიის შექმნა: გადახდა ქართული ბანკებით, მარაგისა და მიწოდების მართვა.' },
  { name: 'მობილური აპლიკაციები', en: 'Mobile apps', text: 'iOS და Android აპლიკაციები, დიზაინიდან App Store-სა და Google Play-ზე განთავსებამდე.' },
  { name: 'UI და UX დიზაინი', en: 'UI/UX design', text: 'ინტერფეისები, რომლებიც მომხმარებლისთვის გასაგები და მოსახერხებელია: სტრუქტურა, პროტოტიპი და დიზაინ სისტემა.' },
  { name: 'SEO ოპტიმიზაცია', en: 'SEO', text: 'ტექნიკური SEO, სტრუქტურა და კონტენტი, რომ Google-მა საიტი სწორად წაიკითხოს და მომხმარებელმა იპოვოს.' },
  { name: 'ბრენდინგი', en: 'Branding', text: 'ლოგო, ფერები, შრიფტები და ვიზუალური ენა.' },
  { name: 'Webu Care', en: 'Website support and maintenance', text: 'გაშვების შემდეგ მონიტორინგი, backup-ები, განახლებები და შეცდომების გასწორება.' },
];

const ORG_ID = `${SITE_URL}/#organization`;

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
        knowsAbout: ['საიტის დამზადება', 'ვებგვერდის დამზადება', 'ონლაინ მაღაზიის შექმნა', 'ვებაპლიკაციის შექმნა', 'მობილური აპლიკაციის შექმნა', 'ვებ დიზაინი', 'UI/UX', 'SEO', 'Web development', 'Mobile app development'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Webu სერვისები',
          itemListElement: SERVICES.map(s => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.name, alternateName: s.en, description: s.text, provider: { '@id': ORG_ID }, areaServed: { '@type': 'Country', name: 'Georgia' } },
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
