'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { LANG_META, LOCALES, lp, type Lang } from '@/lib/i18n';
import { Logo } from './ui';

type Props = { lang: Lang; t: Dict['nav']; alt: Partial<Record<Lang, string>> };

const Globe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Desktop: a compact globe button that opens a menu of languages, each linking to the same page. */
function LangMenu({ lang, alt, label }: { lang: Lang; alt: Props['alt']; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', onDown);
    addEventListener('keydown', onKey);
    return () => { removeEventListener('pointerdown', onDown); removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className="lang-menu" ref={ref}>
      <button type="button" className="lang-btn" aria-haspopup="true" aria-expanded={open} aria-label={`${label}: ${LANG_META[lang].label}`} onClick={() => setOpen(o => !o)}>
        <Globe />
        <span>{LANG_META[lang].short}</span>
        <svg className="lang-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className="lang-pop" aria-label={label}>
          {LOCALES.map(l => (
            <li key={l}>
              <a href={alt[l] ?? lp(l, '/')} hrefLang={LANG_META[l].hreflang} lang={l} aria-current={l === lang ? 'true' : undefined}>
                <span className="lang-code">{LANG_META[l].short}</span>
                <span className="lang-name">{LANG_META[l].label}</span>
                {l === lang && <Check />}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Mobile menu: full language names as large pills. */
function LangPills({ lang, alt, label }: { lang: Lang; alt: Props['alt']; label: string }) {
  return (
    <div className="lang-pills" role="group" aria-label={label}>
      {LOCALES.map(l => (
        <a key={l} href={alt[l] ?? lp(l, '/')} hrefLang={LANG_META[l].hreflang} lang={l} aria-current={l === lang ? 'true' : undefined}>
          {LANG_META[l].label}
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
            <LangMenu lang={lang} alt={alt} label={t.language} />
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
            <button onClick={close} aria-label={t.close} style={{ cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', border: 0, background: '#0E0F12', color: '#C6F432', fontSize: 22, flex: 'none' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {t.items.map(l => <a key={l.id} href={link(l.id)} className="mmenu-link" onClick={close}>{l.label}</a>)}
          </div>
          <LangPills lang={lang} alt={alt} label={t.language} />
          <a href={link('contact')} onClick={close} className="btn-dark" style={{ display: 'flex', justifyContent: 'center', padding: 18, borderRadius: 14, fontWeight: 700, fontSize: 17 }}>{t.cta}</a>
        </div>
      )}
    </>
  );
}
