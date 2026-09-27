'use client';

import { useEffect, useRef, useState } from 'react';
import { JOBS_EMAIL, egg, eggText, eggToast } from '@/lib/eggs-text';
import { lp, type Lang } from '@/lib/i18n';

// /admin: a joke login for people poking at the site. It is fake on purpose:
// no auth, no API calls, nothing typed is sent or stored.
const DODGE = [[0, 0, 0], [90, -70, 8], [-110, 60, -10], [60, -40, 5]];
const COLORS = ['#F2F1EC', '#FF6B4A', '#FF6B4A', '#C6F432', '#B8B8BE', '#8B6CFF', '#FF6B4A'];
const Arrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
);

export default function AdminJoke({ lang }: { lang: Lang }) {
  const t = eggText(lang).admin;
  const [stage, setStage] = useState<'login' | 'hack' | 'caught'>('login');
  const [user, setUser] = useState('');
  const [passLen, setPassLen] = useState(0);
  const [dodge, setDodge] = useState(0);
  const [lines, setLines] = useState(0);
  const [eye, setEye] = useState([0, 0]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Delayed so EggsProvider (a parent, whose effects run later) is already listening.
  useEffect(() => { const ts = timers.current; ts.push(setTimeout(() => egg('url'), 400)); return () => ts.forEach(clearTimeout); }, []);
  useEffect(() => {
    const move = (e: PointerEvent) => setEye([Math.max(-1, Math.min(1, (e.clientX / innerWidth - 0.5) * 2)), Math.max(-1, Math.min(1, (e.clientY / innerHeight - 0.5) * 2))]);
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);

  const hack = [`> admin@webu:~$ sudo login ${user || 'guest'}`, ...t.hack.map(l => `  ${l}`)];
  const canDodge = () => dodge < 3 && matchMedia('(hover:hover)').matches;
  const submit = () => {
    if (canDodge()) { setDodge(d => d + 1); return; }
    setStage('hack'); setLines(0);
    hack.forEach((_, i) => timers.current.push(setTimeout(() => setLines(i + 1), 450 + i * 520)));
    timers.current.push(setTimeout(() => setStage('caught'), 450 + hack.length * 520 + 700));
  };
  const hire = (e: React.MouseEvent) => {
    e.preventDefault();
    (window as unknown as { hire?: () => string }).hire?.();
    const [a, b] = eggText(lang).hireToast;
    // The toast is shown on the home page after navigation (EggsProvider reads it).
    try { sessionStorage.setItem('webu_toast', JSON.stringify({ t: a, s: b.replace('{email}', JOBS_EMAIL) })); } catch { eggToast(a, b); }
    location.href = lp(lang, '/');
  };
  const [dx, dy, rot] = DODGE[Math.min(dodge, 3)];
  const pupil = { transform: `translate(${(eye[0] * 9).toFixed(1)}px,${(eye[1] * 10).toFixed(1)}px)` };

  return (
    <main className={`eg-admin${stage === 'hack' ? ' is-siren' : ''}`}>
      {stage === 'login' && (
        <form className="eg-admin-card" onSubmit={e => { e.preventDefault(); submit(); }} autoComplete="off">
          <div className="eg-admin-top"><span>webu <b>admin</b></span><span>v9.9.9</span></div>
          <p>{t.note}</p>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder={t.user} aria-label={t.user} autoComplete="off" name="u-joke" />
          <input value={'•'.repeat(passLen)} placeholder={t.pass} aria-label={t.pass} autoComplete="off" name="p-joke" inputMode="text"
            onChange={e => setPassLen(e.target.value.length)} className="mono" />
          <span className="eg-admin-note" aria-live="polite">{t.passNotes[Math.min(3, Math.floor(passLen / 3))]}</span>
          <div className="eg-admin-btnwrap">
            <button type="submit" onMouseEnter={() => { if (canDodge()) setDodge(d => d + 1); }}
              style={{ transform: dodge > 0 && dodge < 4 ? `translate(${dx}px,${dy}px) rotate(${rot}deg)` : 'none' }}>
              {t.btn[Math.min(4, dodge)]}
            </button>
          </div>
          <a href={lp(lang, '/')} className="eg-admin-flee">{t.flee}</a>
        </form>
      )}
      {stage === 'hack' && (
        <div className="eg-admin-term" aria-live="polite">
          {hack.slice(0, lines).map((l, i) => <span key={i} style={{ color: COLORS[i] }}>{l}</span>)}
        </div>
      )}
      {stage === 'caught' && (
        <div className="eg-admin-caught">
          <span className="eg-admin-face" aria-hidden="true">
            <span><i style={pupil} /></span><span><i style={pupil} /></span><b />
          </span>
          <span className="eg-admin-denied">ACCESS DENIED</span>
          <h1>{t.caught}</h1>
          <p>{t.caughtText}</p>
          <div className="eg-admin-actions">
            <a href={lp(lang, '/')} onClick={hire} className="eg-admin-hire">hire()<span><Arrow /></span></a>
            <a href={lp(lang, '/')} className="eg-admin-out">{t.leave}</a>
          </div>
        </div>
      )}
    </main>
  );
}
