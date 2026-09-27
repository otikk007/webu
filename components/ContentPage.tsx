import Link from 'next/link';
import Shell from '@/components/Shell';
import { Arrow } from '@/components/ui';
import { getDict } from '@/lib/dict';
import { lp } from '@/lib/i18n';
import { alternates, pageById, pageHref, type ContentPage } from '@/lib/pages';
import { pageJsonLd } from '@/lib/seo';

const LOCALE_TAG = { ka: 'ka-GE', en: 'en-GB', ru: 'ru-RU' } as const;

// Shared layout for service pages, guides and info pages: answer-first summary, facts box,
// question-led sections, sources, FAQ, a CTA back into the funnel and related links.
export default function ContentPageView({ page, updated }: { page: ContentPage; updated: string }) {
  const { lang } = page;
  const t = getDict(lang).content;
  const related = page.related.map(id => pageById(lang, id)).filter((p): p is ContentPage => !!p);
  const home = lp(lang, '/');
  const anchor = (id: string) => `${lang === 'ka' ? '' : `/${lang}`}/#${id}`;
  const crumb = page.kind === 'guide' ? { href: lp(lang, '/blog'), label: t.blog } : { href: anchor('services'), label: t.services };
  const ctaHref = page.id === 'seo' || page.id === 'geo' || page.id === 'cwv' ? anchor('audit') : anchor('contact');
  const date = new Date(updated).toLocaleDateString(LOCALE_TAG[lang], { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Shell lang={lang} alt={alternates(page)} sections={{ top: page.nav, sources: t.sources, faq: t.faq, contact: t.start, related: t.related }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd(page)) }} />
      <main className="cp">
        <section id="top" className="cp-hero">
          <div className="inner">
            <nav aria-label={t.breadcrumb} className="cp-crumbs">
              <Link href={home}>{t.home}</Link><span aria-hidden="true">/</span>
              {page.kind !== 'page' && <><Link href={crumb.href}>{crumb.label}</Link><span aria-hidden="true">/</span></>}
              <span aria-current="page">{page.nav}</span>
            </nav>
            <h1>{page.h1}</h1>
            <p className="cp-answer">{page.answer}</p>
            <div className="cp-cta-row">
              <a href={ctaHref} className="cp-cta">{page.cta}</a>
              <a href={anchor('price')} className="btn-outline">{t.budget}</a>
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
              {b.p?.map(p => <p key={p}>{p}</p>)}
              {b.table && (
                <div className="cp-table-wrap">
                  <table className="cp-table">
                    <thead><tr>{b.table.head.map((h, j) => <th key={j} scope="col">{h}</th>)}</tr></thead>
                    <tbody>{b.table.rows.map(r => <tr key={r[0]}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              {b.list && <ul className="cp-list">{b.list.map(item => <li key={item}>{item}</li>)}</ul>}
            </div>
          </section>
        ))}

        {page.sources && (
          <section id="sources" className="cp-sec">
            <div className="inner cp-narrow">
              <h2>{t.sources}</h2>
              <ol className="cp-sources">
                {page.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></li>)}
              </ol>
            </div>
          </section>
        )}

        <section id="faq" className="cp-sec">
          <div className="inner cp-narrow">
            <h2>{t.faq}</h2>
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
              <p>{t.finalText}</p>
              <div className="cp-cta-row">
                <a href={anchor('contact')} className="btn-dark cp-dark">{t.start} <Arrow /></a>
                <a href={anchor('audit')} className="btn-tel cp-outline-dark">{t.freeAudit}</a>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section id="related" className="cp-sec">
            <div className="inner">
              <h2 className="cp-related-h">{t.related}</h2>
              <div className="cp-related">
                {related.map(r => (
                  <Link key={r.id} href={pageHref(r)} className="card cp-rel">
                    <span className="mono">{r.kind === 'guide' ? t.guide : t.service}</span>
                    <strong>{r.nav}</strong>
                    <Arrow rot={-45} />
                  </Link>
                ))}
              </div>
              <p className="cp-updated">{t.updated} <time dateTime={updated}>{date}</time> · Webu</p>
            </div>
          </section>
        )}
      </main>
    </Shell>
  );
}
