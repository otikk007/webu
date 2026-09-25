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
import Tracker from '@/components/Tracker';
import { preload } from 'react-dom';
import { jsonLd } from '@/lib/seo';

export default function Home() {
  // The hero video poster is the largest paint on first load.
  preload('/assets/s-hero-1280.webp', { as: 'image', fetchPriority: 'high' });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <SvgDefs />
      <Effects />
      <Tracker />
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
