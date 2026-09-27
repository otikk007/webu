'use client';

import { useEffect, useRef, useState } from 'react';
import { egg, eggText, eggToast } from '@/lib/eggs-text';
import type { Lang } from '@/lib/i18n';
import { Logo } from '../ui';

// Header logo with two secrets: 7 quick taps turn it into </> dev for 4s,
// a 1s press shows the "made in Tbilisi" toast. On the home page the logo
// scrolls to the top instead of navigating, so the taps can add up.
export default function LogoEgg({ lang, href, label }: { lang: Lang; href: string; label: string }) {
  const t = eggText(lang);
  const [taps, setTaps] = useState(0);
  const [code, setCode] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [wob, setWob] = useState(0);
  const tapT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lpT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const codeT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longDone = useRef(false);
  const n = useRef(0);

  useEffect(() => () => { clearTimeout(tapT.current); clearTimeout(lpT.current); clearTimeout(codeT.current); }, []);

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    longDone.current = false;
    if (code) return;
    clearTimeout(tapT.current);
    n.current += 1;
    if (n.current >= 7) {
      n.current = 0; setTaps(0); setPressing(false); clearTimeout(lpT.current);
      setCode(true);
      egg('logo');
      setTimeout(() => eggToast(t.logo[0], t.logo[1]), 60);
      clearTimeout(codeT.current); codeT.current = setTimeout(() => setCode(false), 4000);
      return;
    }
    setTaps(n.current); setWob(w => w + 1); setPressing(true);
    tapT.current = setTimeout(() => { n.current = 0; setTaps(0); }, 1500);
    clearTimeout(lpT.current);
    lpT.current = setTimeout(() => {
      longDone.current = true; n.current = 0; setTaps(0); setPressing(false);
      egg('press');
      setTimeout(() => eggToast(t.press[0], t.press[1]), 60);
    }, 1000);
  };
  const up = () => { clearTimeout(lpT.current); setPressing(false); };

  const onClick = (e: React.MouseEvent) => {
    const onHome = location.pathname === href || location.pathname === `${href}/`;
    if (onHome || longDone.current || n.current > 1) {
      e.preventDefault();
      if (onHome && n.current <= 1 && !longDone.current) scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <a href={href} aria-label={label} className="eg-logo" onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onContextMenu={e => e.preventDefault()} onClick={onClick}
      style={{ animation: wob ? `${wob % 2 ? 'egWob' : 'egWobB'} .3s ease-out` : undefined }}>
      <span className="eg-logo-mark" style={{ animation: code ? 'egSpinIn .9s cubic-bezier(.6,0,.3,1)' : undefined }}>
        {code ? <span className="eg-logo-code">&lt;/&gt;</span> : <Logo s={20} u="px" filter="goo-s" dur={4.5} />}
      </span>
      <span style={{ fontFamily: 'var(--unb)', fontSize: 21, fontWeight: 800, letterSpacing: '-0.04em' }}>{code ? 'dev' : 'webu'}</span>
      <span className="eg-logo-bar" style={{ width: pressing && taps <= 1 ? 'calc(100% + 8px)' : 0, transition: pressing && taps <= 1 ? 'width 1s linear' : 'width .2s' }} />
      {Array.from({ length: taps }, (_, i) => (
        <span key={i} className="eg-logo-dot" style={{ left: i * 9, background: i === 6 ? '#8B6CFF' : '#C6F432' }} />
      ))}
    </a>
  );
}
