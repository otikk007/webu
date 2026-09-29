import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import Shell from '@/components/Shell';
import { getDict } from '@/lib/dict';
import { hasLocale, lp } from '@/lib/i18n';
import { PROJECTS } from '@/lib/projects';
import { languageAlternates } from '@/lib/seo';

const ALT = { ka: '/projects', en: '/en/projects', ru: '/ru/projects' };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang).projects;
  return { title: t.title, description: t.description, alternates: { canonical: lp(lang, '/projects'), languages: languageAlternates(ALT) } };
}

export default async function Projects({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const t = d.projects;
  return (
    <Shell lang={lang} alt={ALT} sections={{ top: t.h2 }}>
      <main className="pj-page" id="top">
        <nav aria-label={d.content.breadcrumb} className="cp-crumbs">
          <Link href={lp(lang, '/')}>{d.content.home}</Link><span aria-hidden="true">/</span><span aria-current="page">{t.label}</span>
        </nav>
        <header className="pj-head">
          <div className="pj-head-l">
            <span className="pj-label">{t.label}</span>
            <h1>{t.h2}</h1>
          </div>
          <p>{t.lead}</p>
        </header>
        <div className="pj-grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.id} p={p} lang={lang} n={i + 1} total={PROJECTS.length} meta={t.meta} eager={i < 2} />
          ))}
        </div>
      </main>
    </Shell>
  );
}
