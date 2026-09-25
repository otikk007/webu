import Link from 'next/link';
import Effects from '@/components/Effects';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Tracker from '@/components/Tracker';
import { Arrow, SvgDefs } from '@/components/ui';
import { pageBySlug, type ContentPage } from '@/lib/pages';
import { pageHref, pageJsonLd } from '@/lib/seo';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' });

// Shared layout for service pages and guides: answer-first summary, facts box,
// question-led sections, FAQ, related links and a CTA back into the funnel.
export default function ContentPageView({ page, updated }: { page: ContentPage; updated: string }) {
  const related = page.related.map(pageBySlug).filter((p): p is ContentPage => !!p);
  const crumb = page.kind === 'guide' ? { href: '/blog', label: 'ბლოგი' } : { href: '/#services', label: 'სერვისები' };
  const ctaHref = page.slug === 'seo-aeo-geo' ? '/#audit' : '/#contact';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(page)) }} />
      <SvgDefs />
      <Effects />
      <Tracker />
      <div className="page">
        <Header />
        <main className="cp">
          <section id="top" className="cp-hero">
            <div className="inner">
              <nav aria-label="breadcrumb" className="cp-crumbs">
                <Link href="/">მთავარი</Link><span aria-hidden="true">/</span>
                <Link href={crumb.href}>{crumb.label}</Link><span aria-hidden="true">/</span>
                <span aria-current="page">{page.nav}</span>
              </nav>
              <h1>{page.h1}</h1>
              <p className="cp-answer">{page.answer}</p>
              <div className="cp-cta-row">
                <a href={ctaHref} className="cp-cta">{page.cta}</a>
                <a href="/#price" className="btn-outline">გაიგეთ სავარაუდო ბიუჯეტი</a>
              </div>
              {page.facts && (
                <dl className="cp-facts">
                  {page.facts.map(f => (<div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>))}
                </dl>
              )}
            </div>
          </section>

          {page.blocks.map((b, i) => (
            <section key={b.h2} id={`s${i + 1}`} className="cp-sec">
              <div className="inner cp-narrow">
                <h2>{b.h2}</h2>
                {b.p?.map(t => <p key={t}>{t}</p>)}
                {b.table && (
                  <div className="cp-table-wrap">
                    <table className="cp-table">
                      <thead><tr>{b.table.head.map((h, j) => <th key={j} scope="col">{h}</th>)}</tr></thead>
                      <tbody>{b.table.rows.map(r => <tr key={r[0]}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                )}
                {b.list && <ul className="cp-list">{b.list.map(t => <li key={t}>{t}</li>)}</ul>}
              </div>
            </section>
          ))}

          <section id="faq" className="cp-sec">
            <div className="inner cp-narrow">
              <h2>ხშირად დასმული კითხვები</h2>
              <div className="cp-faq">
                {page.faqs.map(f => (
                  <details key={f.q}>
                    <summary><h3>{f.q}</h3></summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="cp-sec">
            <div className="inner">
              <div className="cp-final r32">
                <h2>{page.cta}</h2>
                <p>ჯერ ვიგებთ თქვენს ბიზნესს, შემდეგ ვქმნით მისთვის სწორ გადაწყვეტას. პირველი 30-წუთიანი კონსულტაცია უფასოა.</p>
                <div className="cp-cta-row">
                  <a href="/#contact" className="btn-dark cp-dark">დაიწყეთ პროექტი <Arrow /></a>
                  <a href="/#audit" className="btn-tel cp-outline-dark">უფასო SEO აუდიტი</a>
                </div>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section id="related" className="cp-sec">
              <div className="inner">
                <h2 className="cp-related-h">ასევე წაიკითხეთ</h2>
                <div className="cp-related">
                  {related.map(r => (
                    <Link key={r.slug} href={pageHref(r)} className="card cp-rel">
                      <span className="mono">{r.kind === 'guide' ? 'გზამკვლევი' : 'სერვისი'}</span>
                      <strong>{r.nav}</strong>
                      <Arrow rot={-45} />
                    </Link>
                  ))}
                </div>
                <p className="cp-updated">განახლებულია: <time dateTime={updated}>{fmtDate(updated)}</time> · Webu</p>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
