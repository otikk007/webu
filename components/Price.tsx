'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { fill } from '@/lib/i18n';
import { ADDONS, TYPES, fmt } from '@/lib/site';
import { track } from '@/lib/track';
import { Arrow } from './ui';

export default function Price({ t }: { t: Dict['price'] }) {
  const [type, setType] = useState('corp');
  const [add, setAdd] = useState<Record<string, boolean>>({ seo: true });

  const sel = TYPES.find(x => x.id === type)!;
  let total = sel.p, wk = sel.w;
  ADDONS.forEach(a => { if (add[a.id]) { total += a.p; wk += a.w; } });

  // count-up 700ms easeOutCubic
  const [shown, setShown] = useState(total);
  const cur = useRef(total);
  useEffect(() => {
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 700), ez = 1 - Math.pow(1 - k, 3);
      cur.current = Math.round(from + (total - from) * ez);
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  return (
    <section id="price" className="sec">
      <div className="inner">
        <h2 className="h2" style={{ marginBottom: 48 }}>{t.h2}</h2>
        <div className="grid">
          <div className="card r32" style={{ flex: '2 1 min(560px,100%)', padding: 'clamp(24px,3vw,40px)' }}>
            <div style={{ fontSize: 15, color: '#9A9AA0', marginBottom: 16 }}>{t.need}</div>
            <div role="radiogroup" aria-label={t.typeLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
              {TYPES.map(x => {
                const on = x.id === type;
                return (
                  <button key={x.id} role="radio" aria-checked={on} onClick={() => { setType(x.id); track('price', t.types[x.id as keyof typeof t.types]); }} style={{ cursor: 'pointer', padding: '16px 22px', borderRadius: 14, fontSize: 16, fontWeight: 600, background: on ? '#F2F1EC' : 'transparent', color: on ? '#0E0F12' : '#F2F1EC', border: `1px solid ${on ? '#F2F1EC' : 'rgba(255,255,255,0.18)'}`, transition: 'background .25s,color .25s,border-color .25s' }}>{t.types[x.id as keyof typeof t.types]}</button>
                );
              })}
            </div>
            <div style={{ fontSize: 15, color: '#9A9AA0', marginBottom: 16 }}>{t.extra}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ADDONS.map(a => {
                const on = !!add[a.id];
                return (
                  <button key={a.id} aria-pressed={on} onClick={() => { setAdd(p => ({ ...p, [a.id]: !p[a.id] })); if (!add[a.id]) track('price', '+ ' + t.addons[a.id as keyof typeof t.addons]); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, fontSize: 15, background: 'transparent', color: '#F2F1EC', border: `1px solid ${on ? '#C6F432' : 'rgba(255,255,255,0.18)'}`, transition: 'border-color .25s' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: on ? '#C6F432' : 'transparent', border: `1px solid ${on ? '#C6F432' : 'rgba(255,255,255,0.3)'}`, transition: 'background .25s' }} />
                    <span>{t.addons[a.id as keyof typeof t.addons]}</span>
                    <span className="mono" style={{ color: '#9A9AA0', fontSize: 13 }}>+{fmt(a.p)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="r32" style={{ flex: '1 1 min(320px,100%)', minWidth: 0, background: '#C6F432', color: '#0E0F12', padding: 'clamp(24px,3vw,40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
            <div style={{ fontFamily: 'var(--mono), var(--geo)', fontSize: 13 }}>{t.budget}</div>
            <div aria-live="polite">
              <div style={{ fontSize: 'clamp(48px,5vw,72px)', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{fmt(shown)}</div>
              <div style={{ marginTop: 12, fontSize: 16 }}>{fill(t.weeks, { n: wk })}</div>
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.75 }}>{t.note}</div>
            </div>
            <a href="#contact" className="btn-dark" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 12px 24px', borderRadius: 14, fontWeight: 600 }}>
              <span>{t.cta}</span>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#C6F432', color: '#0E0F12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Arrow /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
