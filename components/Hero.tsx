'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { Goo } from './ui';

const line = { display: 'flex', alignItems: 'center', gap: '0.2em', flexWrap: 'wrap' } as const;

function heights(k: number) {
  if (k === 0) return [0.22, 0.36, 0.5, 0.68, 0.86, 1];
  let seed = k * 7 + 3;
  const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 6 }, (_, i) => (i === 5 ? 1 : 0.15 + r() * 0.7));
}

export default function Hero({ t }: { t: Dict['hero'] }) {
  const [tg, setTg] = useState(false);
  const [ringN, setRingN] = useState(0);
  const [ringP, setRingP] = useState(false);
  const [rip, setRip] = useState(false);
  const [barsOn, setBarsOn] = useState(false);
  const [barsK, setBarsK] = useState(0);
  const rt = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const a = setTimeout(() => setBarsOn(true), 500);
    const b = setTimeout(() => setTg(true), 1400);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(rt.current); };
  }, []);

  const ringTap = () => {
    clearTimeout(rt.current);
    setRingN(n => n + 1); setRingP(true); setRip(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setRip(true)));
    rt.current = setTimeout(() => setRingP(false), 160);
  };

  return (
    <section id="top" style={{ padding: 'clamp(40px,7vw,96px) var(--pad-x) 0', display: 'flex', justifyContent: 'center' }}>
      <div className="inner">
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(38px,10vw,160px)', lineHeight: 1.02, letterSpacing: '-0.02em', display: 'flex', flexDirection: 'column', gap: '0.06em' }}>
          <span data-depth="14" style={line}>
            {t.l1}
            <button onClick={() => setTg(v => !v)} aria-hidden="true" tabIndex={-1} className="unstyled" style={{ position: 'relative', display: 'inline-block', width: '1.7em', height: '0.7em', borderRadius: 999, background: tg ? '#C6F432' : '#23242a', flex: 'none', transition: 'background .45s cubic-bezier(.7,0,.3,1), box-shadow .45s', boxShadow: tg ? '0 0 0.3em rgba(198,244,50,0.45)' : 'none' }}>
              <span style={{ position: 'absolute', left: '0.1em', top: '0.1em', width: '0.5em', height: '0.5em', borderRadius: '50%', background: tg ? '#0E0F12' : '#F2F1EC', transform: `translateX(${tg ? '1em' : '0em'})`, transition: 'transform .5s cubic-bezier(.5,1.6,.4,1),background .45s', display: 'block' }} />
            </button>
          </span>
          <span data-depth="-10" style={{ ...line, paddingLeft: 'clamp(0px,8vw,140px)' }}>
            <button onClick={ringTap} aria-hidden="true" tabIndex={-1} className="unstyled" style={{ position: 'relative', display: 'inline-block', width: '0.7em', height: '0.7em', borderRadius: '50%', border: '2px solid #C6F432', boxSizing: 'border-box', flex: 'none', background: ringN ? '#C6F432' : 'transparent', transform: `scale(${ringP ? 0.78 : 1})`, transition: 'transform .45s cubic-bezier(.5,1.8,.4,1),background .35s' }}>
              <span style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid #C6F432', opacity: rip ? 0 : 0.9, transform: `scale(${rip ? 2.4 : 1})`, transition: rip ? 'transform .7s cubic-bezier(.2,.7,.2,1),opacity .7s' : 'none', display: 'block', pointerEvents: 'none', visibility: ringN ? 'visible' : 'hidden' }} />
              <span style={{ position: 'absolute', right: '-0.08em', top: '-0.08em', minWidth: '0.26em', height: '0.26em', padding: '0 0.06em', borderRadius: 999, background: '#8B6CFF', color: '#F2F1EC', fontSize: '0.16em', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, transform: `scale(${ringN ? 1 : 0})`, transition: 'transform .4s cubic-bezier(.5,1.8,.4,1)' }}>
                <span style={{ fontSize: '1.6em' }}>{ringN ? Math.min(ringN, 99) : ''}</span>
              </span>
            </button>
            {t.l2}
          </span>
          <span data-depth="20" style={line}>
            {t.l3a} <span style={{ color: '#C6F432' }}>{t.l3b}</span>
            <button onClick={() => setBarsK(k => k + 1)} aria-hidden="true" tabIndex={-1} className="unstyled bars-pill" style={{ position: 'relative', display: 'inline-block', width: '2.2em', height: '0.7em', borderRadius: 999, overflow: 'hidden', background: '#17181C', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box', flex: 'none', transition: 'border-color .25s' }}>
              <span style={{ position: 'absolute', left: '0.26em', right: '0.26em', top: '0.12em', bottom: '0.12em', display: 'flex', alignItems: 'flex-end', gap: '0.09em' }}>
                {heights(barsK).map((v, i) => (
                  <span key={i} style={{ flex: 1, height: (barsOn ? v * 100 : 8) + '%', borderRadius: '0.05em', background: i === 5 ? '#C6F432' : '#3a3b42', transition: 'height .7s cubic-bezier(.4,1.5,.4,1),background .4s', transitionDelay: i * 0.06 + 's', display: 'block' }} />
                ))}
              </span>
            </button>
          </span>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.65, color: '#B9B9BE' }}>
            {t.sub}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', paddingBottom: 8 }}>
            <Goo color="#C6F432">
              <a href="#contact" className="goo-link" style={{ position: 'relative', padding: '19px 30px', color: '#0E0F12', fontWeight: 700, fontSize: 16, borderRadius: 14 }}>{t.cta}</a>
            </Goo>
            <a href="#work" className="btn-outline">{t.cta2}</a>
          </div>
        </div>
        <div data-hero-frame="" className="hero-frame">
          <video poster="/assets/s-hero-1280.webp" muted loop playsInline preload="metadata" className="fill" aria-hidden="true">
            <source src="/assets/hero-laptop-720.mp4" type="video/mp4" media="(max-width: 880px)" />
            <source src="/assets/hero-laptop-1280.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
