'use client';

import { useState } from 'react';
import type { Dict } from '@/lib/dict';
import { Arrow } from './ui';

export default function Faq({ t }: { t: Dict['faq'] }) {
  const FAQS = t.items;
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="sec">
      <div className="inner" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,56px)' }}>
        <div style={{ flex: '1 1 min(420px,100%)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div><h2 className="h2">{t.h2}</h2></div>
          <div className="r32" style={{ background: '#C6F432', color: '#0E0F12', padding: 'clamp(24px,3vw,36px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 48, minHeight: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center' }} aria-hidden="true">
              <span style={{ width: 84, height: 84, borderRadius: '50%', border: '2px solid #0E0F12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800 }}>?</span>
              <span style={{ width: 84, height: 84, borderRadius: '50%', background: '#0E0F12', marginLeft: -22, display: 'block' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 'clamp(26px,2.4vw,34px)', fontWeight: 800, lineHeight: 1.2 }}>{t.noAnswer}</h3>
              <p style={{ margin: '0 0 24px', lineHeight: 1.6, maxWidth: 380 }}>{t.write}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="mailto:hello@webu.ge" className="btn-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '10px 10px 10px 20px', borderRadius: 14, fontWeight: 600 }}>
                  <span>hello@webu.ge</span>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#C6F432', color: '#0E0F12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Arrow size={15} rot={-45} /></span>
                </a>
                <a href="tel:+995555123456" className="btn-tel" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 14, fontWeight: 600 }}>+995 555 12 34 56</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 min(520px,100%)', minWidth: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.1)', alignSelf: 'flex-start' }}>
          {FAQS.map((f, i) => {
            const o = open === i;
            return (
              <div key={f.q} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button className="unstyled" onClick={() => setOpen(o ? -1 : i)} aria-expanded={o} aria-controls={`faq-${i}`} style={{ width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, padding: '28px 0', fontSize: 'clamp(18px,1.8vw,24px)', fontWeight: 600, lineHeight: 1.35 }}>
                  <span>{f.q}</span>
                  <span aria-hidden="true" style={{ flex: 'none', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transform: o ? 'rotate(45deg)' : 'none', transition: 'transform .3s, background .3s', background: o ? '#C6F432' : 'transparent', color: o ? '#0E0F12' : '#F2F1EC' }}>+</span>
                </button>
                <p id={`faq-${i}`} hidden={!o} style={{ margin: '0 0 28px', maxWidth: 560, color: '#B9B9BE', lineHeight: 1.65, fontSize: 16 }}>{f.a}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
