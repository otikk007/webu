import Effects from '@/components/Effects';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Work from '@/components/Work';
import Process from '@/components/Process';
import Audit from '@/components/Audit';
import Price from '@/components/Price';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { SvgDefs } from '@/components/ui';
import { FAQS, SITE_URL } from '@/lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService', name: 'Webu', url: SITE_URL, email: 'hello@webu.ge', telephone: '+995555123456',
      address: { '@type': 'PostalAddress', streetAddress: 'ვაჟა ფშაველას 71', addressLocality: 'თბილისი', addressCountry: 'GE' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SvgDefs />
      <Effects />
      <div className="page">
        <Header />
        <main>
          <Hero />
          <Services />
          <Work />
          <Process />
          <Audit />
          <Price />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
