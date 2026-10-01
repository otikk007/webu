'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TYPES, fmt } from '@/lib/site';
import BugGame from './BugGame';
import Mascot, { type Mood } from './Mascot';
import './assistant.css';

// Webu assistant "ვები". Logic: AIBOT/WEBU_CHATBOT.md (answers come only from the server-side
// FAQ engine, /api/assistant/*). Look and motion: AIBOT/desing (mascot, panel, scrollbar, game).

type Reply = {
  answer: string;
  sources: { title: string; url: string }[];
  mode: 'faq' | 'clarify' | 'fallback';
  intent: string;
  suggestions: string[];
  alternatives: string[];
  offer_lead?: boolean;
};
type BotMsg = { role: 'bot'; text: string; shown: number; mode: Reply['mode']; intent: string; sources: Reply['sources']; suggestions: string[]; alternatives: string[]; offerLead: boolean; game?: boolean };
type Msg = { role: 'user'; text: string } | BotMsg | { role: 'form' } | { role: 'thanks'; text: string };
type Saved = { msgs: Msg[]; previous: string | null; seen: string[]; leadSent: boolean };

const STORE = 'webu-assistant';
const SEEN = 'webu-assistant-seen';
const GAME = /თამაშ|ვითამაშ|game|მოვიწყინ/i;
const LINKS = /(\+995[\d ]{9,13}\d)|([\w.+-]+@webu\.ge)|((?:https:\/\/)?webu\.ge(?:\/[\w\-\/#]*[\w\/#])?)/g;
const PRIVACY = '/konfidencialurobis-politika';
const PHONE = '+995 32 219 22 70';

const STARTERS = [
  ['ფასი', 'რა ღირს საიტის დამზადება?'],
  ['მაღაზია', 'ონლაინ მაღაზია მინდა'],
  ['ვადა', 'რამდენ ხანში მზადდება საიტი?'],
  ['დახმარება', 'არ ვიცი რა მჭირდება'],
] as const;
const CARD_NAMES: Record<string, string> = { land: 'ლენდინგი', biz: 'ბიზნეს საიტი', corp: 'კორპორატიული', shop: 'ონლაინ მაღაზია', app: 'ვებ აპი, CRM', mobile: 'მობილური აპი' };
const GAME_REPLY: BotMsg = {
  role: 'bot', text: 'დაიჭირეთ მწვანე ბურთები და აარიდეთ იისფერ ბაგებს! ამოძრავეთ მაუსით, თითით ან ისრებით. 3 სიცოცხლე გაქვთ.', shown: 0,
  mode: 'faq', intent: '', sources: [], suggestions: ['რა ღირს საიტის დამზადება?', 'არ ვიცი რა მჭირდება'], alternatives: [], offerLead: false, game: true,
};

const Arrow = ({ size = 14, sw = 2.8 }: { size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
);

/** Answer text as React nodes: phone, webu.ge e-mail and webu.ge links become links; nothing is parsed as HTML. */
function linkify(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINKS)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const [s, phone, mail] = m;
    if (phone) out.push(<a key={i} href={`tel:${phone.replace(/\s/g, '')}`}>{s}</a>);
    else if (mail) out.push(<a key={i} href={`mailto:${mail}`}>{s}</a>);
    else out.push(<a key={i} href={toPath(s)}>{s}</a>);
    last = i + s.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
/** webu.ge links open as paths on the current site (works on the live site and the test copy). */
const toPath = (url: string) => url.replace(/^(?:https:\/\/)?webu\.ge/, '') || '/';

function load(): Saved | null {
  try { const s = sessionStorage.getItem(STORE); return s ? JSON.parse(s) as Saved : null; } catch { return null; }
}

export default function Assistant() {
  const saved = useRef<Saved | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [previous, setPrevious] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [leadSent, setLeadSent] = useState(false);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hoverL, setHoverL] = useState(false);
  const [sleepy, setSleepy] = useState(false);
  const [headMood, setHeadMood] = useState<Mood | null>(null);
  const [altsOpen, setAltsOpen] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typeT = useRef<ReturnType<typeof setInterval>>(undefined);
  const lastTop = useRef(0);
  const scrollT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const moodT = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore the conversation of this tab; the teaser and ring only until the first interaction.
  useEffect(() => {
    const s = load();
    saved.current = s;
    if (s) { setMsgs(s.msgs.filter(m => m.role !== 'form')); setPrevious(s.previous); setSeen(s.seen); setLeadSent(s.leadSent); }
    let seenBefore = false;
    try { seenBefore = sessionStorage.getItem(SEEN) === '1'; } catch { /* private mode */ }
    setTouched(seenBefore);
    setReady(true);
    if (seenBefore) return;
    const t = setTimeout(() => setTeaser(true), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(STORE, JSON.stringify({ msgs: msgs.filter(m => m.role !== 'form'), previous, seen, leadSent } satisfies Saved)); } catch { /* private mode */ }
  }, [ready, msgs, previous, seen, leadSent]);

  const markTouched = () => {
    setTeaser(false); setTouched(true);
    try { sessionStorage.setItem(SEEN, '1'); } catch { /* private mode */ }
  };

  // Eyes follow the cursor, mascots tilt toward it; 15 s without movement puts the launcher to sleep.
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last = Date.now();
    const onMove = (e: PointerEvent) => {
      last = Date.now();
      setSleepy(false);
      if (reduce) return;
      document.querySelectorAll<HTMLElement>('.vb-root [data-vb-eyes]').forEach(el => {
        const r = el.getBoundingClientRect(), u = Number(el.dataset.u) || 1;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        el.style.transform = `translate(${(dx / d) * k * 5 * u}px,${(dy / d) * k * 4 * u}px)`;
      });
      document.querySelectorAll<HTMLElement>('.vb-root [data-vb-tilt]').forEach(el => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / 420);
        el.style.transform = `rotate(${Math.max(-14, Math.min(14, dx / 30)) * (0.35 + near)}deg) translate(${dx * near * 0.04}px,${dy * near * 0.04}px)`;
      });
    };
    const sleepT = setInterval(() => { if (Date.now() - last > 15000) setSleepy(true); }, 1000);
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); clearInterval(sleepT); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    return () => { removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [open]);

  useEffect(() => {
    if (!open || !matchMedia('(max-width: 520px)').matches) return;
    const root = document.documentElement, prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const vv = window.visualViewport;
    const fit = () => {
      const panel = document.querySelector<HTMLElement>('.vb-panel');
      if (!panel || !vv) return;
      panel.style.setProperty('--vb-vh', `${vv.height}px`);
      panel.style.setProperty('--vb-top', `${vv.offsetTop}px`);
    };
    fit();
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => { root.style.overflow = prev; vv?.removeEventListener('resize', fit); vv?.removeEventListener('scroll', fit); };
  }, [open]);

  useEffect(() => () => { clearInterval(typeT.current); clearTimeout(scrollT.current); clearTimeout(moodT.current); }, []);

  // Own scrollbar thumb (design §5): native one hidden; violet and squashed while scrolling.
  const syncThumb = useCallback((vel = 0) => {
    const b = bodyRef.current, t = thumbRef.current, tr = trackRef.current;
    if (!b || !t || !tr) return;
    const ch = b.clientHeight, sh = b.scrollHeight, H = tr.clientHeight;
    if (sh <= ch + 2) { tr.style.opacity = '0'; return; }
    const th = Math.max(34, (ch / sh) * H), top = (b.scrollTop / (sh - ch)) * (H - th);
    const sq = Math.min(0.35, Math.abs(vel) / 120);
    t.style.height = `${th}px`;
    t.style.transform = `translateY(${top}px) scale(${1 + sq * 0.8},${1 - sq * 0.5})`;
    t.style.transition = 'width .25s,right .25s,background .25s,transform .12s ease-out';
  }, []);
  const onScroll = () => {
    const b = bodyRef.current;
    if (!b) return;
    const v = b.scrollTop - lastTop.current;
    lastTop.current = b.scrollTop;
    syncThumb(v);
    if (trackRef.current) trackRef.current.style.opacity = '1';
    if (thumbRef.current) Object.assign(thumbRef.current.style, { width: '10px', right: '1px', background: '#8B6CFF' });
    clearTimeout(scrollT.current);
    scrollT.current = setTimeout(() => {
      syncThumb(0);
      if (thumbRef.current) Object.assign(thumbRef.current.style, { width: '6px', right: '3px', background: '#0E0F12' });
      if (trackRef.current) trackRef.current.style.opacity = '.55';
    }, 650);
  };
  useLayoutEffect(() => {
    const b = bodyRef.current;
    if (b && open && (msgs.length > 0 || thinking)) b.scrollTop = b.scrollHeight;
    syncThumb();
  });

  const flash = () => {
    setHeadMood('happy');
    clearTimeout(moodT.current);
    moodT.current = setTimeout(() => setHeadMood(null), 1500);
  };

  // Typewriter: 3 characters every 18 ms; when done the mascot is happy.
  const typeOut = (m: BotMsg) => {
    setMsgs(list => [...list, m]);
    setTyping(true);
    clearInterval(typeT.current);
    typeT.current = setInterval(() => {
      setMsgs(list => {
        const i = list.length - 1, cur = list[i];
        if (!cur || cur.role !== 'bot') return list;
        const shown = Math.min(cur.text.length, cur.shown + 3);
        if (shown >= cur.text.length) { clearInterval(typeT.current); setTyping(false); flash(); }
        const next = list.slice();
        next[i] = { ...cur, shown };
        return next;
      });
    }, 18);
  };

  const send = async (raw: string, rejected = false) => {
    const q = raw.trim().slice(0, 2000);
    if (!q || thinking || typing) return;
    markTouched();
    setError(''); setAltsOpen(false); setDraft('');
    setMsgs(list => [...list.filter(m => m.role !== 'form'), { role: 'user', text: q }]);
    setThinking(true);
    const wait = new Promise(r => setTimeout(r, 900));
    try {
      let reply: BotMsg;
      if (GAME.test(q)) {
        await wait;
        reply = { ...GAME_REPLY };
      } else {
        const res = await fetch('/api/assistant/chat', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: q, previous, seen, rejected }),
        });
        if (!res.ok) throw new Error();
        const r = await res.json() as Reply;
        await wait;
        if (r.mode === 'faq' && r.intent) {
          setPrevious(r.intent);
          setSeen(s => (s.includes(r.intent) ? s : [...s, r.intent]).slice(-50));
        }
        reply = { role: 'bot', text: r.answer, shown: 0, mode: r.mode, intent: r.intent, sources: r.sources ?? [], suggestions: r.suggestions ?? [], alternatives: r.alternatives ?? [], offerLead: !!r.offer_lead };
      }
      setThinking(false);
      typeOut(reply);
    } catch {
      setThinking(false);
      setMsgs(list => { const i = list.map(m => m.role).lastIndexOf('user'); return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)]; });
      setDraft(q);
      setError('შეტყობინება ვერ გაიგზავნა. სცადეთ ხელახლა.');
    }
  };

  const reset = () => {
    clearInterval(typeT.current);
    setMsgs([]); setPrevious(null); setSeen([]); setLeadSent(false);
    setThinking(false); setTyping(false); setError(''); setAltsOpen(false);
  };

  const openForm = () => {
    if (leadSent) return;
    setMsgs(list => (list.some(m => m.role === 'form') ? list : [...list, { role: 'form' }]));
  };

  const formOpen = msgs.some(m => m.role === 'form');
  const lastBot = (() => { for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === 'bot') return i; return -1; })();
  const busy = thinking || typing;
  const status = thinking ? 'ფიქრობს' : typing ? 'წერს' : 'ონლაინ, პასუხობს წამებში';
  const launchMood: Mood = sleepy ? 'sleep' : hoverL ? 'happy' : teaser ? 'wave' : 'idle';
  const topMood: Mood = thinking ? 'think' : headMood ?? (focus ? 'happy' : 'idle');
  const empty = msgs.length === 0 && !thinking;

  if (!ready) return null;

  return (
    <div className={`vb-root${open ? ' is-open' : ''}`}>
      {teaser && !open && (
        <div className="vb-teaser" role="status">
          <button type="button" className="vb-btn vb-teaser-text" onClick={() => { markTouched(); setOpen(true); }}>გამარჯობა! გაინტერესებთ, რა ღირს საიტი?</button>
          <button type="button" className="vb-btn vb-teaser-x" aria-label="დახურვა" onClick={markTouched}>
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="#0E0F12" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6" /></svg>
          </button>
        </div>
      )}

      {open && (
        <section className="vb-panel" role="dialog" aria-label="Webu ასისტენტი">
          <header className="vb-head">
            <button type="button" className="vb-btn vb-head-bot" aria-label="ვები" onClick={flash}><Mascot size={58} mood={topMood} /></button>
            <div className="vb-head-txt">
              <span className="vb-name">ვები</span>
              <span className="vb-status" aria-live="polite">{status}</span>
            </div>
            {!leadSent && (
              <button type="button" className="vb-btn vb-hbtn vb-lead" aria-label="მოთხოვნის დატოვება" title="მოთხოვნის დატოვება" onClick={openForm}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>
              </button>
            )}
            <button type="button" className="vb-btn vb-hbtn vb-reset" aria-label="ახალი საუბარი" title="ახალი საუბარი" onClick={reset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4v4.5h4.5" /></svg>
            </button>
            <button type="button" className="vb-btn vb-hbtn vb-close" aria-label="დახურვა" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" /></svg>
            </button>
          </header>

          <div className="vb-bodywrap">
            <span ref={trackRef} className="vb-track" aria-hidden="true"><span ref={thumbRef} className="vb-thumb" /></span>
            <div ref={bodyRef} className="vb-body" onScroll={onScroll} aria-live="polite">
              {empty && (
                <>
                  <div className="vb-hello">
                    <span className="vb-hello-bot"><Mascot size={130} mood={focus ? 'happy' : 'idle'} /></span>
                    <span className="vb-hello-h">გამარჯობა! მე ვები ვარ.</span>
                    <span className="vb-hello-p">Webu-ს ასისტენტი ვარ. დაგეხმარებით სერვისების, ფასების, ვადებისა და პროცესის გარკვევაში.</span>
                  </div>
                  <div className="vb-starters">
                    {STARTERS.map(([tag, label], i) => (
                      <button key={label} type="button" className="vb-btn vb-starter" style={{ animationDelay: `${0.2 + i * 0.06}s` }} onClick={() => send(label)}>
                        <span className="vb-starter-top"><span className="vb-tag">{tag}</span><span className="vb-arrow"><Arrow size={12} sw={3} /></span></span>
                        <span className="vb-starter-label">{label}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="vb-btn vb-game-link" onClick={() => send('მოდი ვითამაშოთ')}>მოგწყინდათ? მოდი ვითამაშოთ</button>
                </>
              )}

              {msgs.map((m, i) => {
                if (m.role === 'user') return <div key={i} className="vb-user">{m.text}</div>;
                if (m.role === 'thanks') return (
                  <div key={i} className="vb-botrow">
                    <span className="vb-avatar"><Mascot size={22} noIntro /></span>
                    <div className="vb-botcol"><div className="vb-bubble">{linkify(m.text)}</div></div>
                  </div>
                );
                if (m.role === 'form') return <LeadForm key={i} msgs={msgs} seen={seen} onDone={(name) => {
                  setLeadSent(true);
                  setMsgs(list => [...list.filter(x => x.role !== 'form'), { role: 'thanks', text: `მადლობა, ${name}! მოთხოვნა მიღებულია. გუნდი გადახედავს და დაგიკავშირდებათ მითითებულ კონტაქტზე. სასწრაფო საკითხზე დარეკეთ: ${PHONE}.` }]);
                  flash();
                }} />;
                const done = m.shown >= m.text.length;
                const isLast = i === lastBot && i === msgs.length - 1;
                return (
                  <Fragment key={i}>
                    <div className="vb-botrow">
                      <span className="vb-avatar"><Mascot size={22} noIntro /></span>
                      <div className="vb-botcol">
                        <div className="vb-bubble">
                          {m.mode !== 'faq' && <span className="vb-mode">დაზუსტება</span>}
                          {done ? linkify(m.text) : m.text.slice(0, m.shown)}
                          {!done && <span className="vb-caret" aria-hidden="true" />}
                        </div>
                        {done && m.intent === 'price_overview' && (
                          <div className="vb-card">
                            {TYPES.map(t => (
                              <div key={t.id} className="vb-card-row">
                                <span className="vb-card-n">{CARD_NAMES[t.id] ?? t.id}</span>
                                <span className="vb-card-t">~{t.w} კვ</span>
                                <span className="vb-card-p">{fmt(t.p)}</span>
                              </div>
                            ))}
                            <span className="vb-card-note">ან 12 თვეზე, ზედმეტი თანხის გარეშე</span>
                          </div>
                        )}
                        {done && m.game && <BugGame />}
                        {done && m.sources.length > 0 && (
                          <div className="vb-sources">{m.sources.map(s => <a key={s.url + s.title} href={toPath(s.url)}>{s.title}</a>)}</div>
                        )}
                        {done && isLast && m.offerLead && !leadSent && !formOpen && (
                          <button type="button" className="vb-btn vb-cta" onClick={openForm}>
                            დატოვეთ მოთხოვნა<span className="vb-cta-arrow"><Arrow /></span>
                          </button>
                        )}
                      </div>
                    </div>
                    {done && isLast && !busy && m.suggestions.length > 0 && (
                      <div className="vb-chips">
                        {m.suggestions.map(s => <button key={s} type="button" className="vb-btn vb-chip" onClick={() => send(s)}>{s}</button>)}
                      </div>
                    )}
                    {done && isLast && !busy && m.mode === 'faq' && m.alternatives.length > 0 && (
                      altsOpen ? (
                        <div className="vb-chips">
                          <span className="vb-alt-label">იქნებ ეს გაინტერესებთ:</span>
                          {m.alternatives.map(s => <button key={s} type="button" className="vb-btn vb-chip" onClick={() => send(s, true)}>{s}</button>)}
                        </div>
                      ) : (
                        <button type="button" className="vb-btn vb-alt-q" onClick={() => setAltsOpen(true)}>ეს არ არის, რაც გკითხეთ?</button>
                      )
                    )}
                  </Fragment>
                );
              })}

              {thinking && (
                <div className="vb-botrow">
                  <span className="vb-avatar"><Mascot size={22} mood="think" noIntro /></span>
                  <div className="vb-wait" aria-label="ვები ფიქრობს"><span /><span /><span /></div>
                </div>
              )}
              {error && <p className="vb-error" role="alert">{error}</p>}
            </div>
          </div>

          <div className="vb-foot">
            <div className={`vb-input${focus ? ' is-focus' : ''}`}>
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={2000}
                placeholder="ჰკითხეთ Webu-ს ასისტენტს…"
                aria-label="შეკითხვა"
                onChange={e => {
                  setDraft(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(110, e.target.scrollHeight)}px`;
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(draft);
                    e.currentTarget.style.height = 'auto';
                  }
                }}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
              />
              <button type="button" className={`vb-btn vb-send${draft.trim() ? ' is-ready' : ''}`} aria-label="გაგზავნა" aria-disabled={busy || !draft.trim()} onClick={() => send(draft)}>
                <Arrow size={18} sw={2.6} />
              </button>
            </div>
            <p className="vb-note">ასისტენტი პასუხობს webu.ge-ზე გამოქვეყნებული ინფორმაციით.</p>
          </div>
        </section>
      )}

      <button
        type="button"
        className="vb-btn vb-launcher"
        aria-label={open ? 'ჩატის დახურვა' : 'ჩატი Webu-ს ასისტენტთან'}
        aria-expanded={open}
        onClick={() => { markTouched(); setOpen(o => !o); }}
        onMouseEnter={() => setHoverL(true)}
        onMouseLeave={() => setHoverL(false)}
      >
        <span className="vb-shine-wrap" aria-hidden="true"><span className="vb-shine" /></span>
        {!open && !touched && <span className="vb-ring" aria-hidden="true" />}
        {open
          ? <svg className="vb-x" width="22" height="22" viewBox="0 0 14 14" stroke="#C6F432" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" /></svg>
          : <span className="vb-mascot-wrap"><Mascot size={46} mood={launchMood} /></span>}
      </button>
    </div>
  );
}

/** Inline request form (WEBU_CHATBOT.md §4). Sends to /api/assistant/lead; success only when the server confirms. */
function LeadForm({ msgs, seen, onDone }: { msgs: Msg[]; seen: string[]; onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (sending) return;
    const n = name.trim(), c = contact.trim();
    if (!consent) return setErr('გთხოვთ, დაეთანხმოთ კონფიდენციალურობის პოლიტიკას.');
    if (!n || n.length > 80) return setErr('მიუთითეთ სახელი.');
    const phoneOk = /^\+?[\d\s()-]{9,20}$/.test(c) && c.replace(/\D/g, '').length >= 9;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c) && !phoneOk) return setErr('მიუთითეთ სწორი ტელეფონის ნომერი ან ელფოსტა.');
    setErr(''); setSending(true);
    const interests = [...new Set(msgs.flatMap(m => (m.role === 'bot' ? m.sources.map(s => s.title) : [])))].slice(0, 20);
    const transcript = msgs
      .filter((m): m is Extract<Msg, { role: 'user' | 'bot' }> => m.role === 'user' || m.role === 'bot')
      .slice(-12)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text.slice(0, 500) }));
    try {
      const res = await fetch('/api/assistant/lead', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: n, contact: c, need: need.trim().slice(0, 1000), consent, interests: interests.length ? interests : seen.slice(0, 20), transcript }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) throw new Error(d.detail || `მოთხოვნა ვერ გაიგზავნა. სცადეთ ხელახლა ან დარეკეთ: ${PHONE}.`);
      onDone(n);
    } catch (e) {
      setErr(e instanceof Error && e.message ? e.message : `მოთხოვნა ვერ გაიგზავნა. სცადეთ ხელახლა ან დარეკეთ: ${PHONE}.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="vb-form" onSubmit={e => { e.preventDefault(); submit(); }} noValidate>
      <span className="vb-form-h">დატოვეთ მოთხოვნა, გუნდი დაგიკავშირდებათ</span>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="სახელი" aria-label="სახელი" maxLength={80} autoComplete="name" required />
      <input value={contact} onChange={e => setContact(e.target.value)} placeholder="ტელეფონი ან ელფოსტა" aria-label="ტელეფონი ან ელფოსტა" maxLength={120} autoComplete="tel" required />
      <span className="vb-form-lbl">რა გჭირდებათ? (არასავალდებულო)</span>
      <textarea value={need} onChange={e => setNeed(e.target.value)} placeholder="მაგ.: ონლაინ მაღაზია ~100 პროდუქტით, სასურველი ვადა..." aria-label="რა გჭირდებათ? (არასავალდებულო)" maxLength={1000} />
      <label className="vb-consent">
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>ვეთანხმები <a href={PRIVACY} target="_blank" rel="noopener">კონფიდენციალურობის პოლიტიკას</a></span>
      </label>
      {err && <span className="vb-form-err" role="alert">{err}</span>}
      <button type="submit" className="vb-btn vb-form-send" aria-disabled={sending}>
        {sending ? 'იგზავნება...' : 'გაგზავნა'}<span className="vb-cta-arrow"><Arrow /></span>
      </button>
    </form>
  );
}
