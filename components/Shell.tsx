import Effects from '@/components/Effects';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Tracker from '@/components/Tracker';
import EggsProvider from '@/components/eggs/EggsProvider';
import GooScrollbar from '@/components/GooScrollbar';
import { SvgDefs } from '@/components/ui';
import { getDict } from '@/lib/dict';
import type { Lang } from '@/lib/i18n';

/** Page chrome shared by every public page: header with language switch, footer, effects, analytics. */
/** `sections` names the page's sections (by id) in the goo scrollbar; others use their heading. */
export default function Shell({ lang, alt, sections = {}, children }: { lang: Lang; alt: Partial<Record<Lang, string>>; sections?: Record<string, string>; children: React.ReactNode }) {
  const d = getDict(lang);
  return (
    <>
      <SvgDefs />
      <Effects />
      <Tracker />
      <GooScrollbar labels={sections} />
      <EggsProvider lang={lang}>
        <div className="page">
          <Header lang={lang} t={d.nav} alt={alt} />
          {children}
          <Footer lang={lang} t={d.footer} />
        </div>
      </EggsProvider>
    </>
  );
}
