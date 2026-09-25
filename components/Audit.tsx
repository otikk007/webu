'use client';

import { useEffect, useRef, useState } from 'react';

const METRICS = ['სიჩქარე', 'ტექნიკური SEO', 'უსაფრთხოება', 'კონტენტი'];

type Result = { url: string; scores: number[]; issues: string[] };

export default function Audit() {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [send, setSend] = useState<'idle' | 'busy' | 'done'>('idle');
  const [sendErr, setSendErr] = useState('');
  const born = useRef(0);
  useEffect(() => { born.current = Date.now(); }, []);

  const run = async () => {
    const u = url.trim();
    if (!u || scan) return;
    setScan(true); setRes(null); setErr(''); setSend('idle'); setSendErr('');
    try {
      const r = await fetch('/api/audit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: u }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'შემოწმება ვერ მოხერხდა');
      setRes(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'შემოწმება ვერ მოხერხდა');
    } finally {
      setScan(false);
    }
  };

  const request = async () => {
    if (!res || send !== 'idle') return;
    setSend('busy'); setSendErr('');
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'audit', url: res.url, email, scores: res.scores, issues: res.issues, website: hp, t: Date.now() - born.current }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'ვერ გაიგზავნა');
      setSend('done');
    } catch (e) {
      setSend('idle'); setSendErr(e instanceof Error ? e.message : 'ვერ გაიგზავნა');
    }
  };

  const avg = res ? Math.round(res.scores.reduce((a, b) => a + b, 0) / 4) : 0;
  const note = scan ? 'ვამოწმებთ' : err ? 'ვერ შევამოწმეთ' : res ? (avg > 80 ? 'კარგი შედეგია' : avg > 65 ? 'არის რეზერვი' : 'საჭიროებს ყურადღებას') : 'საერთო ქულა';
  const pill = { display: 'flex', gap: 8, padding: 8, borderRadius: 999, background: '#fff', border: '1px solid rgba(14,15,18,0.1)', maxWidth: 520 } as const;
  const field = { flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', padding: '0 16px', fontSize: 16, fontFamily: 'inherit', color: '#0E0F12' } as const;
  const btn = { border: 0, cursor: 'pointer', padding: '14px 24px', borderRadius: 999, background: '#0E0F12', color: '#F2F1EC', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' } as const;

  return (
    <section id="audit" className="sec">
      <div className="inner r40" style={{ borderRadius: 40, background: '#F2F1EC', color: '#0E0F12', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }}>
        <div style={{ flex: '1 1 min(440px,100%)', minWidth: 0 }}>
          <h2 className="h2" style={{ margin: '0 0 20px', fontSize: 'clamp(34px,4.6vw,64px)' }}>რამდენად გხედავთ Google?</h2>
          <p style={{ margin: '0 0 32px', color: '#44454b', lineHeight: 1.6, maxWidth: 480 }}>ჩაწერეთ თქვენი საიტის მისამართი და მიიღეთ სწრაფი შეფასება. სრულ ანგარიშს 24 საათში გამოგიგზავნით.</p>
          <form onSubmit={e => { e.preventDefault(); run(); }} style={pill}>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="tqvenisaiti.ge" aria-label="საიტის მისამართი" inputMode="url" autoCapitalize="off" spellCheck={false} style={field} />
            <button type="submit" className="audit-btn" disabled={scan} style={btn}>{scan ? 'სკანირება...' : 'შემოწმება'}</button>
          </form>
          <div aria-live="polite">
            {err && <p style={{ margin: '14px 0 0 16px', color: '#b3261e', fontSize: 14 }}>{err}</p>}
            {res && send !== 'done' && (
              <form onSubmit={e => { e.preventDefault(); request(); }} style={{ marginTop: 24 }}>
                <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.5 }}>
                  {res.issues.length ? `ნაპოვნია ${res.issues.length} საკითხი. ` : ''}მიიღეთ სრული ანგარიში და რეკომენდაციები ელფოსტაზე 24 საათში.
                </p>
                <div style={pill}>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="თქვენი ელფოსტა" aria-label="ელფოსტა" autoComplete="email" style={field} />
                  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} name="website" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                  <button type="submit" className="audit-btn" disabled={send === 'busy'} style={btn}>{send === 'busy' ? 'იგზავნება...' : 'მიიღეთ ანგარიში'}</button>
                </div>
                {sendErr && <p style={{ margin: '10px 0 0 16px', color: '#b3261e', fontSize: 14 }}>{sendErr}</p>}
              </form>
            )}
            {send === 'done' && <p style={{ margin: '24px 0 0', fontSize: 16, fontWeight: 600 }}>მადლობა! სრულ ანგარიშს 24 საათში გამოგიგზავნით.</p>}
          </div>
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
              const v = res ? res.scores[i] : 0;
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
