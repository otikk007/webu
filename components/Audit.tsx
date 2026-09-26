'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { fill, type Lang } from '@/lib/i18n';
import { track } from '@/lib/track';

type Result = { url: string; scores: number[]; issues: string[] };

// Status colors on the light audit cards; always paired with a text label.
const tone = (v: number) => (v > 80 ? '#1a9e5a' : v > 65 ? '#d98a00' : '#e5484d');

function useCountUp(target: number, ms = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export default function Audit({ lang, t }: { lang: Lang; t: Dict['audit'] }) {
  const [url, setUrl] = useState('');
  const [scan, setScan] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [send, setSend] = useState<'idle' | 'busy' | 'done'>('idle');
  const [sendErr, setSendErr] = useState('');
  const [stepI, setStepI] = useState(0);
  const born = useRef(0);
  useEffect(() => { born.current = Date.now(); }, []);

  // While scanning, cycle through what is being checked.
  useEffect(() => {
    if (!scan) return;
    const id = setInterval(() => setStepI(i => (i + 1) % t.metrics.length), 1100);
    return () => clearInterval(id);
  }, [scan, t.metrics.length]);

  const run = async () => {
    const u = url.trim();
    if (!u || scan) return;
    setScan(true); setStepI(0); setRes(null); setErr(''); setSend('idle'); setSendErr('');
    try {
      const r = await fetch('/api/audit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: u, lang }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || t.failed);
      setRes(d);
      track('audit_run', new URL(d.url).hostname, { v: Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / 4) });
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.failed);
    } finally {
      setScan(false);
    }
  };

  const request = async () => {
    if (!res || send !== 'idle') return;
    setSend('busy'); setSendErr('');
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'audit', url: res.url, email, scores: res.scores, issues: res.issues, website: hp, t: Date.now() - born.current, lang }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || t.sendFailed);
      setSend('done');
      track('audit_request', new URL(res.url).hostname);
    } catch (e) {
      setSend('idle'); setSendErr(e instanceof Error ? e.message : t.sendFailed);
    }
  };

  const avg = res ? Math.round(res.scores.reduce((a, b) => a + b, 0) / 4) : 0;
  const shown = useCountUp(avg);
  const status = res ? (avg > 80 ? t.notes.good : avg > 65 ? t.notes.ok : t.notes.bad) : err ? t.notes.failed : t.notes.total;
  const color = res ? tone(avg) : '#0E0F12';
  const C = 465;

  return (
    <section id="audit" className="sec">
      <div className="inner r40 au">
        <div className="au-left">
          <h2 className="h2 au-h2">{t.h2}</h2>
          <p className="au-text">{t.text}</p>
          <form onSubmit={e => { e.preventDefault(); run(); }} className="au-pill">
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder={t.placeholder} aria-label={t.urlLabel} inputMode="url" autoCapitalize="off" spellCheck={false} className="au-field" />
            <button type="submit" className="au-btn" disabled={scan}>{scan ? t.scanning : t.check}</button>
          </form>
          <div aria-live="polite">
            {err && <p className="au-err">{err}</p>}
            {res && send !== 'done' && (
              <form onSubmit={e => { e.preventDefault(); request(); }} className="au-offer">
                <p>{res.issues.length ? <strong>{fill(t.found, { n: res.issues.length })}</strong> : null}{t.offer}</p>
                <div className="au-pill">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t.email} aria-label={t.emailLabel} autoComplete="email" className="au-field" />
                  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} name="website" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
                  <button type="submit" className="au-btn" disabled={send === 'busy'}>{send === 'busy' ? t.sending : t.request}</button>
                </div>
                {sendErr && <p className="au-err">{sendErr}</p>}
              </form>
            )}
            {send === 'done' && <p className="au-done">{t.thanks}</p>}
          </div>
        </div>

        <div className="au-right" aria-live="polite">
          <div className={`au-card au-ring${scan ? ' is-scanning' : ''}`}>
            <svg viewBox="0 0 180 180" className="au-svg" aria-hidden="true">
              <circle cx="90" cy="90" r="74" fill="none" stroke="#ECEBE6" strokeWidth="12" />
              {scan
                ? <circle className="au-spin" cx="90" cy="90" r="74" fill="none" stroke="url(#ring)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${C * 0.28} ${C}`} />
                : <circle cx="90" cy="90" r="74" fill="none" stroke={res ? color : 'url(#ring)'} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - avg / 100)} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1), stroke .4s' }} />}
            </svg>
            <div className="au-center">
              <span className="au-score" style={{ color: res ? color : undefined }}>{scan ? '' : res ? shown : 0}</span>
              {scan
                ? <span className="au-status au-step">{fill(t.step, { m: t.metrics[stepI] })}</span>
                : <span className="au-status">{res && <i style={{ background: color }} />}{status}</span>}
            </div>
          </div>
          <div className="au-card au-bars">
            {t.metrics.map((m, i) => {
              const v = res ? res.scores[i] : 0;
              return (
                <div key={m} className={scan && i === stepI ? 'is-active' : undefined}>
                  <div className="au-bar-head"><span>{m}</span><span className="mono" style={{ color: res ? tone(v) : undefined }}>{res ? v : scan ? '·' : 0}</span></div>
                  <div className="au-track">
                    <div className={`au-fill${scan ? ' is-scanning' : ''}`} style={{ width: scan ? '100%' : v + '%', background: res ? tone(v) : undefined, transitionDelay: res ? `${0.15 + i * 0.12}s` : '0s' }} />
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
