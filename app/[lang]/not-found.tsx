import Link from 'next/link';
import { getDict } from '@/lib/dict';
import { lp } from '@/lib/i18n';
import { pageHref, servicePages } from '@/lib/pages';

// not-found cannot read route params, so it uses the default language.
export default function NotFound() {
  const lang = 'ka';
  const t = getDict(lang).notFound;
  return (
    <main className="nf">
      <title>{t.title}</title>
      <meta name="robots" content="noindex" />
      <p className="mono">404</p>
      <h1>{t.h1}</h1>
      <p>{t.text}</p>
      <nav aria-label="links">
        <Link href={lp(lang, '/')} className="cp-cta">{t.home}</Link>
        {servicePages(lang).map(p => <Link key={p.id} href={pageHref(p)}>{p.nav}</Link>)}
        <Link href="/en">English</Link>
        <Link href="/ru">Русский</Link>
      </nav>
    </main>
  );
}
