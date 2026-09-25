'use client';

import { useState } from 'react';
import type { Dict } from '@/lib/dict';
import { Arrow } from './ui';

export default function Process({ t }: { t: Dict['process'] }) {
  const STEPS = t.steps;
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <section id="process" className="sec">
      <div className="inner">
        <h2 className="h2" style={{ marginBottom: 48 }}>{t.h2}</h2>
        <div className="grid">
          <div style={{ flex: '1 1 min(420px,100%)', minWidth: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {STEPS.map((st, i) => (
              <button key={st.n} className="unstyled" onClick={() => setStep(i)} aria-pressed={i === step} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '26px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: i === step ? '#F2F1EC' : '#6E6F76' }}>
                <span className="mono" style={{ fontSize: 14, width: 32 }}>{st.n}</span>
                <span style={{ flex: 1, fontSize: 'clamp(22px,2.4vw,34px)', fontWeight: 700 }}>{st.title}</span>
                <span style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === step ? '#C6F432' : 'rgba(255,255,255,0.08)', color: '#0E0F12', transition: 'background .3s', flex: 'none' }}><Arrow size={18} /></span>
              </button>
            ))}
          </div>
          <div className="card r32" style={{ flex: '1 1 min(420px,100%)', padding: 'clamp(24px,3vw,40px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 40, minHeight: 420 }} aria-live="polite">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 'clamp(80px,10vw,140px)', fontWeight: 900, lineHeight: 0.9, color: '#C6F432' }}>{s.n}</span>
              <span style={{ padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', fontSize: 13, fontFamily: 'var(--mono), var(--geo)' }}>{s.time}</span>
            </div>
            <div>
              <p style={{ margin: '0 0 24px', fontSize: 19, lineHeight: 1.6, color: '#D6D6DA' }}>{s.text}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {s.out.map(o => <span key={o} style={{ padding: '9px 15px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.16)', fontSize: 14 }}>{o}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
