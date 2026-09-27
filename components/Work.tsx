'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { egg, type EggText } from '@/lib/eggs-text';
import ClientTip from './eggs/ClientTip';
import { WORKS as MEDIA } from '@/lib/site';
import { Arrow } from './ui';

const NS = 8, SLIDE = 5200, PHASE = 750;
type Phase = 'idle' | 'cover' | 'reveal';

// Easter egg: holding the pointer on this project (index) for 1.8s reveals its backstory.
const SECRET = 2;

export default function Work({ t, secret }: { t: Dict['work']; secret: EggText['client'] }) {
  const [tip, setTip] = useState(false);
  const tipT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tipOn = () => { clearTimeout(tipT.current); tipT.current = setTimeout(() => { setTip(true); egg('client'); }, 1800); };
  const tipOff = () => { clearTimeout(tipT.current); setTip(false); };
  const WORKS = MEDIA.map((m, i) => ({ ...m, ...t.items[i] }));
  const [wi, setWi] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [prog, setProg] = useState(false);
  const st = useRef({ wi: 0, phase: 'idle' as Phase });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wt = useRef<ReturnType<typeof setTimeout>>(undefined);
  const goRef = useRef<(dir: number, abs?: number) => void>(() => {});

  const startWork = useCallback(() => {
    clearTimeout(wt.current);
    setProg(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setProg(true)));
    wt.current = setTimeout(() => goRef.current(1), SLIDE);
  }, []);

  const go = useCallback((dir: number, abs?: number) => {
    if (st.current.phase !== 'idle') return;
    clearTimeout(wt.current);
    const next = abs != null ? abs : (st.current.wi + dir + WORKS.length) % WORKS.length;
    if (next === st.current.wi) { startWork(); return; }
    st.current.phase = 'cover'; setPhase('cover'); setProg(false);
    timers.current.push(setTimeout(() => {
      st.current.wi = next; st.current.phase = 'reveal'; setWi(next); setPhase('reveal');
      timers.current.push(setTimeout(() => { st.current.phase = 'idle'; setPhase('idle'); startWork(); }, PHASE));
    }, PHASE));
  }, [startWork]);
  goRef.current = go;

  useEffect(() => {
    startWork();
    const t = timers.current;
    return () => { clearTimeout(wt.current); t.forEach(clearTimeout); };
  }, [startWork]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="work" className="sec">
      <div className="inner">
        <div className="head-row">
          <div style={{ flex: '1 1 520px' }}>
            <h2 className="h2">{t.h2}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 14, color: '#9A9AA0', marginRight: 8 }} aria-live="polite">{pad(wi + 1)} / {pad(WORKS.length)}</span>
            <button className="circle-btn" onClick={() => go(-1)} aria-label={t.prev}><Arrow size={20} rot={180} /></button>
            <button className="circle-btn" onClick={() => go(1)} aria-label={t.next}><Arrow size={20} /></button>
          </div>
        </div>
        <div className="grid">
          <div data-stage="" className="r32" onClick={() => go(1)} style={{ flex: '2 1 min(640px,100%)', minWidth: 0, position: 'relative', overflow: 'hidden', aspectRatio: '16/10', background: '#17181C', cursor: 'pointer' }}>
            {WORKS.map((w, i) => (
              <div key={w.name} style={{ position: 'absolute', inset: 0, opacity: i === wi ? 1 : 0 }}>
                {w.vid
                  ? (
                    <video poster={w.poster} muted loop playsInline preload="none" className="fill" aria-label={w.name}>
                      <source src={w.src.replace('.mp4', '-720.mp4')} type="video/mp4" media="(max-width: 880px)" />
                      <source src={w.src.replace('.mp4', '-1280.mp4')} type="video/mp4" />
                    </video>
                  )
                  : <Image src={w.src} alt={w.name} fill sizes="(max-width: 880px) 100vw, 66vw" style={{ objectFit: 'cover', animation: 'kb 9s ease-in-out infinite alternate' }} />}
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }} aria-hidden="true">
              {Array.from({ length: NS }, (_, i) => (
                <div key={i} style={{ flex: 1, background: '#C6F432', marginBottom: -1, transformOrigin: phase === 'reveal' ? '100% 50%' : '0% 50%', transform: phase === 'cover' ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform .42s cubic-bezier(.7,0,.25,1)', transitionDelay: (phase === 'idle' ? 0 : i * 0.045) + 's' }} />
              ))}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.12)' }}>
              <div style={{ height: '100%', background: '#C6F432', width: prog ? '100%' : '0%', transition: `width ${prog ? SLIDE : 0}ms linear` }} />
            </div>
          </div>
          <div style={{ flex: '1 1 min(320px,100%)', minWidth: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {WORKS.map((w, i) => (
              <button key={w.name} className="unstyled" onClick={() => go(0, i)} aria-current={i === wi} {...(i === SECRET ? { onMouseEnter: tipOn, onMouseLeave: tipOff, onTouchStart: tipOn, onTouchEnd: tipOff, onContextMenu: (e: React.MouseEvent) => e.preventDefault() } : {})} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '22px 4px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: i === wi ? '#C6F432' : '#F2F1EC', paddingLeft: i === wi ? 16 : 4 }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 'clamp(20px,1.8vw,26px)', fontWeight: 700 }}>{w.name}</span>
                  <span style={{ fontSize: 13, color: '#9A9AA0' }}>{w.cat}</span>
                </span>
                <span className="mono" style={{ fontSize: 13 }}>{w.year}</span>
                {i === SECRET && tip && <ClientTip t={secret} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
