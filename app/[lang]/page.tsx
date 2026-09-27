import { notFound } from 'next/navigation';
import { preload } from 'react-dom';
import Audit from '@/components/Audit';
import Contact from '@/components/Contact';
import Faq from '@/components/Faq';
import Hero from '@/components/Hero';
import Price from '@/components/Price';
import Process from '@/components/Process';
import Services from '@/components/Services';
import Shell from '@/components/Shell';
import Work from '@/components/Work';
import { getDict } from '@/lib/dict';
import { hasLocale } from '@/lib/i18n';
import { eggText } from '@/lib/eggs-text';
import { jsonLd } from '@/lib/seo';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  // The hero video poster is the largest paint on first load.
  preload('/assets/s-hero-1280.webp', { as: 'image', fetchPriority: 'high' });

  return (
    <Shell lang={lang} alt={{ ka: '/', en: '/en', ru: '/ru' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(lang)) }} />
      <main>
        <Hero t={d.hero} />
        <Services lang={lang} t={d.services} serp={d.serp} />
        <Work t={d.work} secret={eggText(lang).client} />
        <Process t={d.process} />
        <Audit lang={lang} t={d.audit} />
        <Price t={d.price} />
        <Faq t={d.faq} />
        <Contact lang={lang} t={d.contact} />
      </main>
    </Shell>
  );
}
