'use client';

import { useEffect, useRef, useState } from 'react';

// Custom "goo" scrollbar (slidebar/README.md). The page still scrolls natively;
// this only draws the indicator. Desktop pointers only; phones keep the native bar.
// Physics runs in a rAF loop writing styles through refs, never 60fps setState.

type Sec = { id: string; top: number; label: string; theme: string };
type Theme = 'dark' | 'lime' | 'violet' | 'light';

const INK = '#0E0F12', PAPER = '#F2F1EC', LIME = '#C6F432', VIOLET = '#8B6CFF';
// [thumb, drop] per section background (README §5).
const PAL: Record<Theme, [string, string]> = { dark: [LIME, VIOLET], lime: [INK, VIOLET], violet: [LIME, INK], light: [INK, VIOLET] };
const pad2 = (n: number) => String(n).padStart(2, '0');

export default function GooScrollbar({ labels }: { labels: Record<string, string> }) {
  const [on, setOn] = useState(false);
  const [secs, setSecs] = useState<Sec[]>([]);
  const [cur, setCur] = useState(0);
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);
  const [active, setActive] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const drop = useRef<HTMLSpanElement>(null);
  const trail = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const awakeRef = useRef(false);
  const dragRef = useRef(false);

  const open = hover || drag, awake = open || active;
  awakeRef.current = awake;
  dragRef.current = drag;

  // Only on devices with a real mouse.
  useEffect(() => {
    const mq = matchMedia('(hover:hover) and (pointer:fine)');
    const set = () => setOn(mq.matches);
    set(); mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useEffect(() => {
    if (!on) return;
    const html = document.documentElement;
    html.classList.add('has-goo-scroll');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sections: every main section with an id; label from the dictionary, else its heading.
    let offs: number[] = [];
    const measure = () => {
      const max = Math.max(1, html.scrollHeight - innerHeight);
      const els = [...document.querySelectorAll<HTMLElement>('main section[id]')];
      offs = els.map(el => el.getBoundingClientRect().top + scrollY);
      setSecs(els.map((el, i) => {
        const h = el.querySelector('h1,h2')?.textContent?.trim() ?? el.id;
        return {
          id: el.id,
          top: Math.min(1, offs[i] / max),
          label: labels[el.id] ?? (h.length > 30 ? h.slice(0, 28).trimEnd() + '...' : h),
          theme: el.dataset.scrollTheme ?? 'dark',
        };
      }));
    };
    measure();
    const t1 = setTimeout(measure, 150);
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    addEventListener('resize', measure);

    let activeT: ReturnType<typeof setTimeout>;
    const onScroll = () => { setActive(true); clearTimeout(activeT); activeT = setTimeout(() => setActive(false), 1400); };
    addEventListener('scroll', onScroll, { passive: true });

    // Spring physics (README §3); starts at the current position so a reload mid-page is right.
    const max0 = Math.max(1, html.scrollHeight - innerHeight);
    const k = { y: scrollY / max0, vy: 0, d: scrollY / max0, vd: 0, h: 28, last: scrollY };
    let raf = 0, lastCur = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const max = html.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
      const vel = scrollY - k.last; k.last = scrollY;
      if (still) { k.y = p; k.d = p; k.h = 28; }
      else {
        k.vy += (p - k.y) * 0.22; k.vy *= 0.62; k.y += k.vy;
        k.vd += (k.y - k.d) * 0.07; k.vd *= 0.78; k.d += k.vd;
        k.h += ((28 + Math.min(90, Math.abs(vel) * 1.4)) - k.h) * 0.2;
      }
      const y = Math.max(0, Math.min(1, k.y)), aw = awakeRef.current;
      const H = aw ? k.h : Math.max(20, k.h * 0.8);
      const pct = `${(y * 100).toFixed(3)}%`;
      if (thumb.current) { thumb.current.style.top = pct; thumb.current.style.height = `${H.toFixed(1)}px`; thumb.current.style.marginTop = `${(-H / 2).toFixed(1)}px`; }
      if (trail.current) trail.current.style.height = pct;
      if (chip.current) { chip.current.style.top = pct; chip.current.textContent = `${Math.round(y * 100)}%`; }
      if (drop.current) {
        const dD = aw && !still ? Math.max(0, 14 - Math.abs(k.y - k.d) * 60) : 0;
        drop.current.style.top = `${(Math.max(0, Math.min(1, k.d)) * 100).toFixed(3)}%`;
        drop.current.style.width = drop.current.style.height = `${dD.toFixed(1)}px`;
        drop.current.style.marginTop = drop.current.style.marginLeft = `${(-dD / 2).toFixed(1)}px`;
      }
      // Current section: the last one whose top is above the middle of the screen.
      const mid = scrollY + innerHeight * 0.5;
      let c = 0; offs.forEach((o, i) => { if (mid >= o) c = i; });
      if (c !== lastCur) { lastCur = c; setCur(c); }
    };
    raf = requestAnimationFrame(loop);

    const seek = (clientY: number) => {
      const r = track.current!.getBoundingClientRect();
      scrollTo({ top: Math.max(0, Math.min(1, (clientY - r.top) / r.height)) * (html.scrollHeight - innerHeight) });
    };
    const move = (e: PointerEvent) => { if (dragRef.current) { e.preventDefault(); seek(e.clientY); } };
    const up = () => { if (dragRef.current) setDrag(false); };
    const down = (e: PointerEvent) => { e.preventDefault(); setDrag(true); dragRef.current = true; seek(e.clientY); };
    const tr = track.current!;
    tr.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);

    return () => {
      html.classList.remove('has-goo-scroll');
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(activeT); ro.disconnect();
      removeEventListener('resize', measure); removeEventListener('scroll', onScroll);
      tr.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up);
    };
  }, [on, labels]);

  if (!on) return null;

  const theme = (secs[cur]?.theme ?? 'dark') as Theme;
  const [tc, dc] = PAL[theme] ?? PAL.dark;
  const light = theme === 'lime' || theme === 'light';
  const tFg = tc === INK ? PAPER : INK;
  const W = awake ? 20 : 6;

  return (
    <div className={`gs${open ? ' is-open' : ''}${awake ? ' is-awake' : ''}${drag ? ' is-drag' : ''}${light ? ' is-light' : ''}`} aria-hidden="true"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="gs-bg" />
      <div ref={track} className="gs-track">
        <div className="gs-line" />
        <div ref={trail} className="gs-trail" style={{ background: tc }} />
        <div className="gs-goo">
          <div className="gs-goo-in">
            {secs.map((s, i) => {
              const d = awake ? (i === cur ? 0 : 6) : 4;
              return <span key={s.id} className="gs-tick" style={{ top: `${(s.top * 100).toFixed(3)}%`, width: d, height: d, marginTop: -d / 2, left: 14 - d / 2, background: i < cur ? tc : light ? '#A1A19F' : '#5F6063' }} />;
              // Solid colors: the goo filter's alpha threshold would erase a translucent dot.
            })}
            <span ref={thumb} className="gs-thumb" style={{ width: W, left: 14 - W / 2, background: tc }} />
            <span ref={drop} className="gs-drop" style={{ background: dc }} />
          </div>
        </div>
        <span ref={chip} className="gs-chip" style={{ background: tc, color: tFg, opacity: active && !open ? 1 : 0 }} />
        {secs.map((s, i) => (
          <div key={s.id} className="gs-label" style={{ top: `${(s.top * 100).toFixed(3)}%` }}
            onClick={e => { e.stopPropagation(); const el = document.getElementById(s.id); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'smooth' }); }}
            onPointerDown={e => e.stopPropagation()}>
            <span className="gs-num">{pad2(i + 1)}</span>
            <span className="gs-pill" style={i === cur ? { background: tc, color: tFg } : undefined}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
