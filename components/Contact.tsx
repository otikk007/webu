'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { fill, type Lang } from '@/lib/i18n';
import { QUOTE_EVENT, QUOTE_KEY } from '@/lib/quote';
import { track } from '@/lib/track';
import { Arrow, Goo } from './ui';

const TIMES = ['10:00', '11:30', '13:00', '15:00', '16:30'];
type YMD = { y: number; m: number; d: number };

export default function Contact({ lang, t }: { lang: Lang; t: Dict['contact'] }) {
  const MONTHS = t.months, WEEKDAYS = t.weekdays;
  const day = (d: number, m: number) => fill(t.dayFormat, { d, m: t.monthsGen[m] });
  const [cal, setCal] = useState<{ y: number; m: number } | null>(null);
  const [selD, setSelD] = useState<YMD | null>(null);
  const [selT, setSelT] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const born = useRef(0);
  const [quote, setQuote] = useState('');
  useEffect(() => {
    try { setQuote(sessionStorage.getItem(QUOTE_KEY) ?? ''); } catch { /* private mode */ }
    const on = (e: Event) => setQuote((e as CustomEvent<string>).detail);
    window.addEventListener(QUOTE_EVENT, on);
    return () => window.removeEventListener(QUOTE_EVENT, on);
  }, []);
  useEffect(() => { born.current = Date.now(); }, []);

  // month depends on the visitor's clock, so it is set after hydration
  useEffect(() => { const n = new Date(); setCal({ y: n.getFullYear(), m: n.getMonth() }); }, []);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // A slot is gone once it starts less than an hour from now.
  const slotGone = (d: YMD, t: string) => {
    const [h, m] = t.split(':').map(Number);
    return +new Date(d.y, d.m, d.d, h, m) < Date.now() + 60 * 60 * 1000;
  };

  const cells: React.ReactNode[] = [];
  if (cal) {
    const first = (new Date(cal.y, cal.m, 1).getDay() + 6) % 7, dim = new Date(cal.y, cal.m + 1, 0).getDate();
    for (let i = 0; i < first; i++) cells.push(<span key={'e' + i} />);
    for (let d = 1; d <= dim; d++) {
      const dt = new Date(cal.y, cal.m, d), off = dt < today;
      const sel = !!selD && selD.y === cal.y && selD.m === cal.m && selD.d === d;
      const isT = +dt === +today;
      cells.push(
        <button key={d} className="unstyled" disabled={off} aria-pressed={sel} aria-label={day(d, cal.m)}
          onClick={() => { if (!off) { const nd = { y: cal.y, m: cal.m, d }; setSelD(nd); setDone(false); if (selT && slotGone(nd, selT)) setSelT(null); } }}
          style={{ cursor: off ? 'default' : 'pointer', aspectRatio: '1', maxHeight: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center', width: '100%', maxWidth: 52, fontSize: 16, background: sel ? '#C6F432' : 'transparent', color: sel ? '#0E0F12' : off ? '#4A4B52' : '#F2F1EC', boxShadow: isT && !sel ? 'inset 0 0 0 1px #C6F432' : 'none', transition: 'background .2s' }}>
          {d}
        </button>,
      );
    }
  }

  const booking = done ? t.booked
    : selD && selT ? `${day(selD.d, selD.m)}, ${selT}`
    : selD ? `${day(selD.d, selD.m)}, ${t.pickTime}`
    : t.pickBoth;

  const confirm = async () => {
    if (done || busy) return;
    if (!selD || !selT) { setErr(t.pickBoth); return; }
    if (!name.trim() || !contact.trim()) { setErr(t.needContact); return; }
    setBusy(true); setErr('');
    const date = `${selD.y}-${String(selD.m + 1).padStart(2, '0')}-${String(selD.d).padStart(2, '0')}`;
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'booking', name, contact, date, time: selT, quote, website: hp, t: Date.now() - born.current, lang }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || t.failed);
      setDone(true);
      track('booking', `${date} ${selT}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.failed);
    } finally {
      setBusy(false);
    }
  };

  const field = { width: '100%', border: 0, outline: 0, borderRadius: 14, background: 'rgba(14,15,18,0.08)', padding: '14px 16px', fontSize: 16, fontFamily: 'inherit', color: '#0E0F12' } as const;

  const shift = (k: number) => setCal(c => {
    if (!c) return c;
    const m = c.m + k;
    return { y: c.y + Math.floor(m / 12), m: (m + 12) % 12 };
  });

  const navBtn = { cursor: 'pointer', width: 42, height: 42 } as const;

  return (
    <section id="contact" className="sec">
      <div className="inner">
        <h2 className="h2" style={{ marginBottom: 48, maxWidth: 980 }}>{t.h2}</h2>
        <div className="grid">
          <div className="card r32" style={{ flex: '1 1 min(460px,100%)', padding: 'clamp(20px,3vw,32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
              <button className="circle-btn" style={navBtn} onClick={() => shift(-1)} aria-label={t.prevMonth}><Arrow rot={180} /></button>
              <span aria-live="polite" style={{ padding: '10px 20px', borderRadius: 999, background: 'rgba(198,244,50,0.14)', color: '#C6F432', fontWeight: 600, minWidth: 170, textAlign: 'center' }}>{cal ? `${MONTHS[cal.m]} ${cal.y}` : ' '}</span>
              <button className="circle-btn" style={navBtn} onClick={() => shift(1)} aria-label={t.nextMonth}><Arrow /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6, textAlign: 'center' }}>
              {WEEKDAYS.map(w => <span key={w} style={{ fontSize: 12, color: '#9A9AA0', padding: '6px 0', fontFamily: 'var(--mono), var(--geo)' }}>{w}</span>)}
              {cells}
            </div>
          </div>
          <div style={{ flex: '1 1 min(380px,100%)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card r32" style={{ padding: 'clamp(20px,3vw,32px)' }}>
              <div style={{ fontSize: 15, color: '#9A9AA0', marginBottom: 16 }}>{t.free}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TIMES.map(t => {
                  const on = selT === t, gone = !!selD && slotGone(selD, t);
                  return <button key={t} className="mono" aria-pressed={on} disabled={gone} onClick={() => { setSelT(t); setDone(false); }} style={{ cursor: gone ? 'default' : 'pointer', padding: '12px 18px', borderRadius: 14, fontSize: 14, background: on ? '#C6F432' : 'transparent', color: on ? '#0E0F12' : gone ? '#4A4B52' : '#F2F1EC', border: `1px solid ${on ? '#C6F432' : gone ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.18)'}` }}>{t}</button>;
                })}
              </div>
            </div>
            <div className="r32" style={{ flex: 1, background: '#C6F432', color: '#0E0F12', padding: 'clamp(20px,3vw,32px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28 }}>
              <div>
                <div style={{ fontFamily: 'var(--mono), var(--geo)', fontSize: 13, marginBottom: 10 }}>{t.yours}</div>
                <div aria-live="polite" style={{ fontSize: 'clamp(24px,2.4vw,32px)', fontWeight: 800, lineHeight: 1.25 }}>{booking}</div>
                {quote && <div className="bk-quote"><span>{t.quoteLabel}</span>{quote}</div>}
              </div>
              {!done && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder={t.name} aria-label={t.name} autoComplete="name" style={field} />
                  <input value={contact} onChange={e => { setContact(e.target.value); setErr(''); }} placeholder={t.contact} aria-label={t.contact} autoComplete="tel" style={field} />
                  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} name="website" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                  {err && <div role="alert" style={{ fontSize: 14, fontWeight: 600 }}>{err}</div>}
                </div>
              )}
              <Goo color="#0E0F12" style={{ alignSelf: 'flex-start' }}>
                <button className="unstyled" onClick={confirm} disabled={busy} style={{ position: 'relative', padding: '19px 30px', color: '#F2F1EC', fontWeight: 700, fontSize: 16 }}>{done ? t.thanks : busy ? t.sending : t.confirm}</button>
              </Goo>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
