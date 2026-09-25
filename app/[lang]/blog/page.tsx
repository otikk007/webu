import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import { Arrow } from '@/components/ui';
import { getDict } from '@/lib/dict';
import { hasLocale, lp } from '@/lib/i18n';
import { guides, pageHref } from '@/lib/pages';
import { languageAlternates } from '@/lib/seo';

const ALT = { ka: '/blog', en: '/en/blog', ru: '/ru/blog' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang).content;
  return { title: t.blogTitle, description: t.blogDescription, alternates: { canonical: lp(lang, '/blog'), languages: languageAlternates(ALT) } };
}

export default async function Blog({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang).content;
  return (
    <Shell lang={lang} alt={ALT}>
      <main className="cp">
        <section id="top" className="cp-hero">
          <div className="inner">
            <nav aria-label={t.breadcrumb} className="cp-crumbs"><Link href={lp(lang, '/')}>{t.home}</Link><span aria-hidden="true">/</span><span aria-current="page">{t.blog}</span></nav>
            <h1>{t.blog}</h1>
            <p className="cp-answer">{t.blogLead}</p>
          </div>
        </section>
        <section id="posts" className="cp-sec">
          <div className="inner">
            <div className="cp-related">
              {guides(lang).map(g => (
                <Link key={g.id} href={pageHref(g)} className="card cp-rel cp-post">
                  <span className="mono">{t.guide}</span>
                  <strong>{g.h1}</strong>
                  <span className="cp-post-d">{g.description}</span>
                  <Arrow rot={-45} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Shell>
  );
}
