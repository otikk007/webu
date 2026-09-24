'use client';

import { useEffect, useState } from 'react';
import { NAV } from '@/lib/site';
import { Logo } from './ui';

export default function Header() {
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

  return (
    <>
      <header className="header">
        <nav className="nav" aria-label="მთავარი ნავიგაცია">
          <a href="#top" aria-label="Webu, მთავარი" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo s={20} u="px" filter="goo-s" dur={4.5} />
            <span style={{ fontFamily: 'var(--unb)', fontSize: 21, fontWeight: 800, letterSpacing: '-0.04em' }}>webu</span>
          </a>
          <div className="nav-links">
            {NAV.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </div>
          <a href="#contact" className="nav-cta">დაგვიკავშირდი</a>
          <button className="menu-btn" onClick={() => setMenu(true)} aria-label="მენიუ" aria-expanded={menu}>
            <span /><span />
          </button>
        </nav>
      </header>
      {menu && (
        <div className="mmenu" role="dialog" aria-modal="true" aria-label="მენიუ">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--unb)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>webu</span>
            <button onClick={close} aria-label="დახურვა" style={{ cursor: 'pointer', width: 48, height: 48, borderRadius: '50%', border: 0, background: '#0E0F12', color: '#C6F432', fontSize: 22 }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {NAV.map(l => <a key={l.href} href={l.href} className="mmenu-link" onClick={close}>{l.label}</a>)}
          </div>
          <a href="#contact" onClick={close} className="btn-dark" style={{ display: 'flex', justifyContent: 'center', padding: 18, borderRadius: 14, fontWeight: 700, fontSize: 17 }}>დაჯავშნე კონსულტაცია</a>
        </div>
      )}
    </>
  );
}
