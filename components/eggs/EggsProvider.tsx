'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EGG_IDS, JOBS_EMAIL, eggText, eggToast, type EggId } from '@/lib/eggs-text';
import type { Lang } from '@/lib/i18n';

// Site-wide easter eggs (see new/README.md): the found-eggs store and toast,
// the console greeting with window.hire(), the Konami code with retro mode,
// and the overscroll character at the bottom of every page.

const KEY = 'webu_eggs';
const KSEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const fillT = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));

function readFound(): EggId[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export default function EggsProvider({ lang, children, overscroll = true }: { lang: Lang; children?: React.ReactNode; overscroll?: boolean }) {
  const t = eggText(lang);
  const [toast, setToast] = useState<{ t: string; s: string } | null>(null);
  const [retro, setRetro] = useState(false);
  const [splash, setSplash] = useState(false);
  const [pull, setPull] = useState(0);
  const [eye, setEye] = useState([0, 0]);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((tt: string, s: string) => {
    clearTimeout(toastT.current);
    setToast({ t: tt, s });
    toastT.current = setTimeout(() => setToast(null), 3400);
  }, []);

  const find = useCallback((id: EggId) => {
    const found = readFound();
    if (found.includes(id) || !EGG_IDS.includes(id)) return;
    found.push(id);
    try { localStorage.setItem(KEY, JSON.stringify(found)); } catch { /* private mode */ }
    showToast(fillT(t.found, { name: t.names[id] }), found.length >= 8 ? t.all : fillT(t.progress, { n: found.length }));
  }, [showToast, t]);

  // Events from other components (header logo, cursor, portfolio, secret pages).
  useEffect(() => {
    const onEgg = (e: Event) => find((e as CustomEvent<EggId>).detail);
    const onToast = (e: Event) => { const d = (e as CustomEvent<{ t: string; s: string }>).detail; showToast(d.t, d.s); };
    // A toast queued before a page change (e.g. hire() on /admin).
    try {
      const q = sessionStorage.getItem('webu_toast');
      if (q) { sessionStorage.removeItem('webu_toast'); const d = JSON.parse(q); setTimeout(() => showToast(d.t, d.s), 600); }
    } catch { /* storage unavailable */ }
    addEventListener('webu:egg', onEgg);
    addEventListener('webu:toast', onToast);
    return () => { removeEventListener('webu:egg', onEgg); removeEventListener('webu:toast', onToast); clearTimeout(toastT.current); };
  }, [find, showToast]);

  // Console greeting and window.hire(), once per page load.
  useEffect(() => {
    const w = window as unknown as { hire?: () => string; __webuHello?: boolean };
    const [hello, know, want, thanks, waiting] = t.console;
    if (!w.__webuHello) {
      w.__webuHello = true;
      console.log('%cwebu', 'font:800 48px sans-serif;color:#C6F432;letter-spacing:-3px');
      console.log(`%c${hello}`, 'font:800 18px sans-serif;color:#F2F1EC;background:#0E0F12;padding:6px 10px;border-radius:6px');
      console.log(`%c${know}`, 'font:14px sans-serif;color:#B8B8BE');
      console.log(`%c${want}%chire()`, 'font:14px sans-serif', 'color:#C6F432;font-family:monospace;font-size:14px;font-weight:bold');
    }
    w.hire = () => {
      find('console');
      console.log(`%c${fillT(thanks, { email: JOBS_EMAIL })}`, 'font:700 14px sans-serif;color:#0E0F12;background:#C6F432;padding:8px 12px;border-radius:6px');
      return waiting;
    };
  }, [find, t]);

  // Konami code.
  useEffect(() => {
    let i = 0;
    let splashT: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!KSEQ.includes(k)) return;
      i = KSEQ[i] === k ? i + 1 : k === 'ArrowUp' ? (i === 2 ? 2 : 1) : 0;
      if (i === KSEQ.length) {
        i = 0;
        setRetro(true); setSplash(true);
        clearTimeout(splashT); splashT = setTimeout(() => setSplash(false), 1600);
        find('konami');
        setTimeout(() => eggToast(t.konami[0], t.konami[1]), 60);
      }
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); clearTimeout(splashT); };
  }, [find, t]);

  // Overscroll: keep pulling at the very bottom of the page.
  useEffect(() => {
    if (!overscroll) return;
    let p = 0, resetT: ReturnType<typeof setTimeout>, ty = 0;
    const apply = (dy: number) => {
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
      if (!atBottom || dy <= 0) { if (dy < 0 && p) { p = 0; setPull(0); } return; }
      p = Math.min(1, p + dy / 500);
      setPull(p);
      if (p > 0.55) find('overscroll');
      clearTimeout(resetT);
      resetT = setTimeout(() => { p = 0; setPull(0); }, p > 0.55 ? 2600 : 500);
    };
    const onWheel = (e: WheelEvent) => apply(e.deltaY);
    const onTS = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTM = (e: TouchEvent) => { const y = e.touches[0].clientY; apply((ty - y) * 2); ty = y; };
    const onMove = (e: MouseEvent) => setEye([Math.max(-1, Math.min(1, (e.clientX / innerWidth - 0.5) * 2)), Math.max(-1, Math.min(1, (e.clientY / innerHeight - 0.5) * 2))]);
    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('touchstart', onTS, { passive: true });
    addEventListener('touchmove', onTM, { passive: true });
    addEventListener('mousemove', onMove, { passive: true });
    return () => { removeEventListener('wheel', onWheel); removeEventListener('touchstart', onTS); removeEventListener('touchmove', onTM); removeEventListener('mousemove', onMove); clearTimeout(resetT); };
  }, [overscroll, find]);

  const up = pull > 0.55, peek = pull > 0.35, R = Math.round(20 + pull * 70);
  const pullTr = pull ? 'height .25s cubic-bezier(.3,1.4,.5,1),border-radius .25s' : 'height .7s cubic-bezier(.3,1.6,.4,1),border-radius .7s';

  return (
    <>
      {children}

      {overscroll && (
        <div className="eg-pull" aria-hidden="true" style={{ height: pull * 240, transition: pullTr }}>
          <div className="eg-pull-bg" style={{ borderRadius: `50% 50% 0 0 / ${R}px ${R}px 0 0`, transition: pullTr }} />
          <div className="eg-blob" style={{ transform: peek ? `translateY(${up ? -88 : -40}px) rotate(${up ? 0 : -6}deg)` : 'translateY(30px)' }}>
            <span className="eg-blob-body">
              {[0, 1].map(i => (
                <span key={i} className="eg-blob-eye"><span style={{ transform: `translate(${(eye[0] * 5).toFixed(1)}px,${(eye[1] * 5 - (up ? 3 : 0)).toFixed(1)}px)` }} /></span>
              ))}
            </span>
            <span className="eg-hand l" style={{ transform: `rotate(${up ? 40 : -10}deg)` }} />
            <span className="eg-hand r" style={{ transform: `rotate(${up ? -40 : 10}deg)` }} />
          </div>
          <div className="eg-pull-text" style={{ opacity: pull > 0.4 ? 1 : 0 }}>
            <span>{up ? t.pull[2] : t.pull[0]}</span>
            <span>{up ? t.pull[3] : t.pull[1]}</span>
          </div>
        </div>
      )}

      {splash && (
        <div className="eg-splash" aria-hidden="true">
          <div><span>LEVEL UP</span><span>+30 LIVES · WEBU MODE</span></div>
        </div>
      )}

      {retro && (
        <>
          <div className="eg-retro-color" aria-hidden="true" />
          <div className="eg-retro-lines" aria-hidden="true" />
          <div className="eg-retro-vig" aria-hidden="true" />
          <div className="eg-retro-badge">RETRO MODE · 1UP<button type="button" onClick={() => setRetro(false)}>EXIT</button></div>
        </>
      )}

      <div className={`eg-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        <span className="eg-toast-face" aria-hidden="true"><i /><i /></span>
        <span className="eg-toast-txt"><strong>{toast?.t}</strong><span>{toast?.s}</span></span>
      </div>
    </>
  );
}
