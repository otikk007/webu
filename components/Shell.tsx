import Effects from '@/components/Effects';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Tracker from '@/components/Tracker';
import { SvgDefs } from '@/components/ui';
import { getDict } from '@/lib/dict';
import type { Lang } from '@/lib/i18n';

/** Page chrome shared by every public page: header with language switch, footer, effects, analytics. */
export default function Shell({ lang, alt, children }: { lang: Lang; alt: Partial<Record<Lang, string>>; children: React.ReactNode }) {
  const d = getDict(lang);
  return (
    <>
      <SvgDefs />
      <Effects />
      <Tracker />
      <div className="page">
        <Header lang={lang} t={d.nav} alt={alt} />
        {children}
        <Footer lang={lang} t={d.footer} />
      </div>
    </>
  );
}
