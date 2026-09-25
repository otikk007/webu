import type { Metadata } from 'next';
import Link from 'next/link';
import Effects from '@/components/Effects';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Tracker from '@/components/Tracker';
import { Arrow, SvgDefs } from '@/components/ui';
import { GUIDES } from '@/lib/pages';
import { pageHref } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'ბლოგი: საიტები, აპლიკაციები, SEO და AI ძიება | Webu',
  description: 'Webu-ს გზამკვლევები საიტის დამზადებაზე, ფასებზე, აპლიკაციებზე, SEO-სა და AI ძიებაზე, ბიზნესისთვის გასაგებ ენაზე.',
  alternates: { canonical: '/blog' },
};

export default function Blog() {
  return (
    <>
      <SvgDefs />
      <Effects />
      <Tracker />
      <div className="page">
        <Header />
        <main className="cp">
          <section id="top" className="cp-hero">
            <div className="inner">
              <nav aria-label="breadcrumb" className="cp-crumbs"><Link href="/">მთავარი</Link><span aria-hidden="true">/</span><span aria-current="page">ბლოგი</span></nav>
              <h1>ბლოგი</h1>
              <p className="cp-answer">გზამკვლევები საიტის დამზადებაზე, ფასებზე, აპლიკაციებზე, SEO-სა და AI ძიებაზე, ბიზნესისთვის გასაგებ ენაზე.</p>
            </div>
          </section>
          <section id="posts" className="cp-sec">
            <div className="inner">
              <div className="cp-related">
                {GUIDES.map(g => (
                  <Link key={g.slug} href={pageHref(g)} className="card cp-rel cp-post">
                    <span className="mono">გზამკვლევი</span>
                    <strong>{g.h1}</strong>
                    <span className="cp-post-d">{g.description}</span>
                    <Arrow rot={-45} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
