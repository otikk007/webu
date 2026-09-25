'use client';

import { useEffect, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { LANG_META, LOCALES, lp, type Lang } from '@/lib/i18n';
import { Logo } from './ui';

type Props = { lang: Lang; t: Dict['nav']; alt: Partial<Record<Lang, string>> };

/** KA / EN / RU links to the same page in the other languages. */
function LangSwitch({ lang, alt, label, dark }: { lang: Lang; alt: Props['alt']; label: string; dark?: boolean }) {
  return (
    <div className={`lang-switch${dark ? ' dark' : ''}`} role="group" aria-label={label}>
      {LOCALES.map(l => (
        <a key={l} href={alt[l] ?? lp(l, '/')} hrefLang={LANG_META[l].hreflang} lang={l} aria-current={l === lang ? 'true' : undefined} title={LANG_META[l].label}>
          {LANG_META[l].short}
        </a>
      ))}
    </div>
  );
}

export default function Header({ lang, t, alt }: Props) {
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    const onResize = () => { if (innerWidth >= 880) setMenu(false); };
    addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    return () => { removeEventListener('keydown', onKey); removeEventListener('resize', onResize); };
  }, [menu]);

  const close = () => setMenu(false);
  const home = lp(lang, '/');
  const link = (id: string) => `${lang === 'ka' ? '' : `/${lang}`}/#${id}`;

  return (
    <>
      <header className="header">
        <nav className="nav" aria-label={t.main}>
          <a href={home} aria-label={t.home} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo s={20} u="px" filter="goo-s" dur={4.5} />
            <span style={{ fontFamily: 'var(--unb)', fontSize: 21, fontWeight: 800, letterSpacing: '-0.04em' }}>webu</span>
          </a>
          <div className="nav-links">
            {t.items.map(l => <a key={l.id} href={link(l.id)}>{l.label}</a>)}
          </div>
          <div className="nav-end">
            <LangSwitch lang={lang} alt={alt} label={t.language} />
            <a href={link('contact')} className="nav-cta">{t.cta}</a>
            <button className="menu-btn" onClick={() => setMenu(true)} aria-label={t.menu} aria-expanded={menu}>
              <span /><span />
            </button>
          </div>
        </nav>
      </header>
      {menu && (
        <div className="mmenu" role="dialog" aria-modal="true" aria-label={t.menu}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--unb)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>webu</span>
            <LangSwitch lang={lang} alt={alt} label={t.language} dark />
            <button onClick={close} aria-label={t.close} style={{ cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', border: 0, background: '#0E0F12', color: '#C6F432', fontSize: 22, flex: 'none' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {t.items.map(l => <a key={l.id} href={link(l.id)} className="mmenu-link" onClick={close}>{l.label}</a>)}
          </div>
          <a href={link('contact')} onClick={close} className="btn-dark" style={{ display: 'flex', justifyContent: 'center', padding: 18, borderRadius: 14, fontWeight: 700, fontSize: 17 }}>{t.cta}</a>
        </div>
      )}
    </>
  );
}
