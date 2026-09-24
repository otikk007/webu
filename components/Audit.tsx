'use client';

import { useEffect, useRef, useState } from 'react';

const METRICS = ['სიჩქარე', 'ტექნიკური SEO', 'მობილური', 'კონტენტი'];

export default function Audit() {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(false);
  const [res, setRes] = useState<number[] | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  // Demo scoring: deterministic values 52..95 from a hash of the URL.
  const run = () => {
    const u = url.trim();
    if (!u || scan) return;
    setScan(true); setRes(null);
    let h = 0;
    for (const c of u) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const r = (i: number) => 52 + ((h >> (i * 5)) % 44);
    t.current = setTimeout(() => { setScan(false); setRes([r(0), r(1), r(2), r(3)]); }, 1500);
  };

  const avg = res ? Math.round(res.reduce((a, b) => a + b, 0) / 4) : 0;
  const note = scan ? 'ვამოწმებთ' : res ? (avg > 80 ? 'კარგი შედეგია' : avg > 65 ? 'არის რეზერვი' : 'საჭიროებს ყურადღებას') : 'საერთო ქულა';

  return (
    <section id="audit" className="sec">
      <div className="inner r40" style={{ borderRadius: 40, background: '#F2F1EC', color: '#0E0F12', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 min(440px,100%)', minWidth: 0 }}>
          <h2 className="h2" style={{ margin: '0 0 20px', fontSize: 'clamp(34px,4.6vw,64px)' }}>რამდენად გხედავს Google?</h2>
          <p style={{ margin: '0 0 32px', color: '#44454b', lineHeight: 1.6, maxWidth: 480 }}>ჩაწერე შენი საიტის მისამართი და მიიღე სწრაფი შეფასება. სრულ ანგარიშს 24 საათში გამოგიგზავნით.</p>
          <form onSubmit={e => { e.preventDefault(); run(); }} style={{ display: 'flex', gap: 8, padding: 8, borderRadius: 999, background: '#fff', border: '1px solid rgba(14,15,18,0.1)', maxWidth: 520 }}>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="shenisaiti.ge" aria-label="საიტის მისამართი" inputMode="url" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', padding: '0 16px', fontSize: 16, fontFamily: 'inherit', color: '#0E0F12' }} />
            <button type="submit" className="audit-btn" style={{ border: 0, cursor: 'pointer', padding: '14px 24px', borderRadius: 999, background: '#0E0F12', color: '#F2F1EC', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>{scan ? 'სკანირება...' : 'შემოწმება'}</button>
          </form>
        </div>
        <div style={{ flex: '1 1 min(440px,100%)', minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 16 }} aria-live="polite">
          <div style={{ flex: '1 1 min(220px,100%)', minWidth: 0, borderRadius: 28, background: '#fff', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 260 }}>
            <svg viewBox="0 0 180 180" style={{ width: 200, height: 200, transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx="90" cy="90" r="74" fill="none" stroke="#ECEBE6" strokeWidth="14" />
              <circle cx="90" cy="90" r="74" fill="none" stroke="url(#ring)" strokeWidth="14" strokeLinecap="round" strokeDasharray="465" strokeDashoffset={465 * (1 - avg / 100)} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{scan ? '...' : res ? avg : 0}</span>
              <span style={{ fontSize: 13, color: '#5b5c62', marginTop: 6 }}>{note}</span>
            </div>
          </div>
          <div style={{ flex: '1 1 min(220px,100%)', minWidth: 0, borderRadius: 28, background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            {METRICS.map((m, i) => {
              const v = res ? res[i] : 0;
              return (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}><span>{m}</span><span className="mono">{v}</span></div>
                  <div style={{ height: 8, borderRadius: 999, background: '#ECEBE6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: '#0E0F12', width: v + '%', transition: 'width 1.1s cubic-bezier(.2,.8,.2,1)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
