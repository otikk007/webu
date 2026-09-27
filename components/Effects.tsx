'use client';

import { useEffect, useRef } from 'react';
import { IDLE_CODE, egg } from '@/lib/eggs-text';

const P = 170;
const EASE = 'cubic-bezier(.2,.7,.2,1)';

/**
 * Page-wide behaviours from the reference (§7): scroll progress, section reveal,
 * hero frame scale, smooth anchors, video play/pause, and (fine pointer only)
 * goo buttons, cursor ring, magnetic links, card tilt, hero parallax, footer letters.
 */
export default function Effects() {
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(t: K, f: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      addEventListener(t, f, o);
      cleanups.push(() => removeEventListener(t, f));
    };
    const fx = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

    // videos play only while visible
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) { v.muted = true; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.05 });
    document.querySelectorAll('video').forEach(v => vio.observe(v));
    cleanups.push(() => vio.disconnect());

    // reveal
    let h2s: HTMLElement[] = [];
    if (fx && 'IntersectionObserver' in window) {
      const els = [...document.querySelectorAll<HTMLElement>('section h2, .r32, .r40, #process button, #faq button, #work button')]
        .filter(el => !el.closest('#top'));
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        io.unobserve(el);
        el.style.opacity = '1';
        el.style.transform = 'none';
      }), { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
      els.forEach(el => {
        const d = Math.min([...el.parentElement!.children].indexOf(el), 5) * 0.07;
        el.style.transition = `opacity .8s ${EASE} ${d}s, transform .9s ${EASE} ${d}s, clip-path 1s cubic-bezier(.7,0,.2,1) ${d}s, border-color .3s, background .25s, color .3s, padding .3s`;
        if (el.tagName === 'H2') { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'translateY(40px)'; h2s.push(el); return; }
        el.style.opacity = '0';
        el.style.transform = 'translateY(48px)';
        io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    }

    // scroll: progress bar, h2 reveal, hero frame scale
    const hf = document.querySelector<HTMLElement>('[data-hero-frame]');
    const scrollFrame = () => {
      const de = document.documentElement, p = scrollY / Math.max(1, de.scrollHeight - innerHeight);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (h2s.length) h2s = h2s.filter(h => {
        if (h.getBoundingClientRect().top < innerHeight * 0.9) { h.style.clipPath = 'inset(0 0 -20% 0)'; h.style.transform = 'none'; return false; }
        return true;
      });
      if (hf && fx) {
        const r = hf.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          const k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
          hf.style.transform = `scale(${(0.88 + 0.12 * k).toFixed(4)})`;
        }
      }
    };
    let ticking = false;
    on('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; scrollFrame(); }); }, { passive: true });
    on('resize', scrollFrame);
    scrollFrame();

    // smooth anchors
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = id && document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY - 90;
      scrollTo({ top, behavior: fx ? 'smooth' : 'auto' });
      history.replaceState(null, '', '#' + id);
    };
    document.addEventListener('click', onClick);
    cleanups.push(() => document.removeEventListener('click', onClick));

    if (fx && fine) {
      // goo buttons
      const goos = [...document.querySelectorAll<HTMLElement>('[data-goo]')].map(w => ({
        w, dots: [...w.querySelectorAll<HTMLElement>('[data-dot]')].map(d => ({ el: d, r: d.offsetWidth / 2 })),
        x: 0, y: 0, vx: 0, vy: 0, init: false,
      }));
      const T = [0.28, 0.55, 0.8, 1];
      let gx = -9999, gy = -9999, running = false, idle = 0, graf = 0;
      const step = () => {
        let moving = false;
        for (const g of goos) {
          const r = g.w.getBoundingClientRect();
          if (r.bottom < -200 || r.top > innerHeight + 200) continue;
          const ax = Math.min(Math.max(gx, r.left + 22), r.right - 22), ay = r.bottom - 6;
          const inside = gx >= r.left && gx <= r.right && gy >= r.top && gy <= r.bottom;
          const att = !inside && Math.hypot(gx - ax, gy - ay) < 150 && gy > r.top + r.height * 0.4;
          const tx = att ? gx : ax, ty = att ? gy : ay - 10;
          if (!g.init) { g.x = tx; g.y = ty; g.init = true; }
          g.vx = (g.vx + (tx - g.x) * 0.2) * 0.7; g.vy = (g.vy + (ty - g.y) * 0.2) * 0.7;
          g.x += g.vx; g.y += g.vy;
          if (Math.abs(g.vx) + Math.abs(g.vy) > 0.08 || att) moving = true;
          const ox = r.left - P, oy = r.top - P;
          g.dots.forEach((d, i) => {
            const t = T[i], px = ax + (g.x - ax) * t - ox - d.r, py = ay + (g.y - ay) * t - oy - d.r;
            d.el.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
          });
        }
        idle = moving ? 0 : idle + 1;
        if (idle < 20) graf = requestAnimationFrame(step); else running = false;
      };
      on('mousemove', e => { gx = e.clientX; gy = e.clientY; idle = 0; if (!running) { running = true; graf = requestAnimationFrame(step); } }, { passive: true });
      running = true; graf = requestAnimationFrame(step);
      cleanups.push(() => cancelAnimationFrame(graf));

      // cursor ring, magnetic, tilt, parallax, letters
      const ring = ringRef.current!, lab = labRef.current!, idleBox = idleRef.current!, codeEl = codeRef.current!;
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0, mode = '';
      let mag: HTMLElement | null = null, card: HTMLElement | null = null;
      const lines = [...document.querySelectorAll<HTMLElement>('[data-depth]')];
      const letters = [...document.querySelectorAll<HTMLElement>('[data-letter]')];
      const light = new WeakMap<HTMLElement, boolean>();
      const setMode = (m: string) => {
        if (m === mode) return; mode = m;
        const big = m === 'stage', link = m === 'link', hide = m === 'hide';
        ring.style.width = ring.style.height = big ? '96px' : link ? '54px' : '32px';
        ring.style.background = big ? '#C6F432' : link ? 'rgba(198,244,50,0.14)' : 'transparent';
        ring.style.borderColor = big ? '#C6F432' : hide ? 'transparent' : 'rgba(198,244,50,0.8)';
        lab.style.opacity = big ? '1' : '0';
      };
      const lightBg = (el: HTMLElement) => {
        if (!light.has(el)) { const c = getComputedStyle(el).backgroundColor.match(/\d+/g) || ['0', '0', '0']; light.set(el, +c[0] + +c[1] + +c[2] > 450); }
        return light.get(el)!;
      };
      const releaseCard = () => { if (!card) return; card.style.transition = `transform .7s ${EASE}, opacity .8s, border-color .3s`; card.style.transform = 'none'; card.style.backgroundImage = ''; card = null; };
      const releaseMag = () => { if (!mag) return; mag.style.transition = 'translate .5s cubic-bezier(.5,1.6,.4,1), background .25s, color .25s, border-color .25s'; mag.style.translate = '0 0'; mag = null; };
      const tick = () => {
        rx += (mx - rx) * 0.22; ry += (my - ry) * 0.22;
        ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px) translate(-50%,-50%)`;
        idleBox.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
        if (scrollY < innerHeight * 1.2) {
          const nx = mx / innerWidth - 0.5, ny = my / innerHeight - 0.5;
          lines.forEach(l => { const d = +l.dataset.depth!; l.style.translate = `${(nx * d).toFixed(1)}px ${(ny * d * 0.5).toFixed(1)}px`; });
        }
        // Letters (hero headline, footer wordmark) are pushed away from the cursor and light up near it.
        // Each group is checked for visibility separately so off-screen letters cost nothing.
        letters.forEach(L => {
          const r = L.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) { if (L.style.translate || L.style.color) { L.style.translate = ''; L.style.color = ''; } return; }
          const dx = r.left + r.width / 2 - mx, dy = r.top + r.height / 2 - my, d = Math.hypot(dx, dy), R = 260;
          if (d < R) {
            const f = 1 - d / R;
            // data-still letters (hero) only change color; the footer wordmark also moves aside.
            if (L.dataset.still === undefined) L.style.translate = `${(dx / d * f * 28 || 0).toFixed(1)}px ${(dy / d * f * 38 || 0).toFixed(1)}px`;
            L.style.color = f > 0.35 ? (L.dataset.hover || '#C6F432') : '';
          } else if (L.style.translate || L.style.color) { L.style.translate = ''; L.style.color = ''; }
        });
        raf = Math.abs(mx - rx) + Math.abs(my - ry) > 0.3 ? requestAnimationFrame(tick) : 0;
      };
      // Easter egg: the ring gets bored. 4s still -> falls asleep (z Z); 6.2s -> starts typing code.
      let idleT = 0, seen = false, idleState = '';
      const setIdle = (st: string) => {
        if (st === idleState) return;
        idleState = st;
        idleBox.dataset.state = st;
        ring.style.scale = st === 'sleep' ? '.7' : st === 'code' ? '.5' : '';
        if (st === 'code') ring.style.borderColor = '#8B6CFF';
        else if (!st) { const m = mode; mode = '*'; setMode(m); }
      };
      const idleIv = setInterval(() => {
        if (!seen || idleT >= 200 || ring.style.opacity !== '1') return;
        idleT++;
        if (idleT === 40) egg('idle');
        if (idleT >= 62) {
          setIdle('code');
          codeEl.firstChild!.textContent = IDLE_CODE.slice(0, Math.max(0, Math.floor((idleT - 62) / 1.2)));
        } else if (idleT >= 40) setIdle('sleep');
      }, 100);
      cleanups.push(() => clearInterval(idleIv));

      on('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        seen = true; idleT = 0; if (idleState) setIdle('');
        if (!raf) raf = requestAnimationFrame(tick);
        const t = e.target as Element;
        if (ring.style.opacity !== '1') ring.style.opacity = '1';
        const stage = t.closest?.('[data-stage]');
        const link = t.closest?.<HTMLElement>('a,button');
        setMode(t.closest?.('input') ? 'hide' : stage ? 'stage' : link ? 'link' : '');
        const m = link && !link.closest('[data-goo]') && !link.closest('.nav-links') && !stage ? link : null;
        if (m !== mag) { releaseMag(); mag = m; if (mag) mag.style.transition = 'translate .15s ease-out, background .25s, color .25s, border-color .25s'; }
        if (mag) {
          const r = mag.getBoundingClientRect(), cl = (v: number, n: number) => Math.max(-n, Math.min(n, v));
          mag.style.translate = `${cl((mx - r.left - r.width / 2) * 0.28, 12).toFixed(1)}px ${cl((my - r.top - r.height / 2) * 0.38, 9).toFixed(1)}px`;
        }
        const c = t.closest?.<HTMLElement>('.r32') ?? null;
        if (c !== card) { releaseCard(); card = c && c.style.opacity !== '0' ? c : null; if (card) card.style.transition = 'transform .18s ease-out, opacity .8s, border-color .3s'; }
        if (card) {
          const r = card.getBoundingClientRect(), x = mx - r.left, y = my - r.top, nx = x / r.width - 0.5, ny = y / r.height - 0.5;
          card.style.transform = `perspective(1100px) rotateX(${(-ny * 4).toFixed(2)}deg) rotateY(${(nx * 5).toFixed(2)}deg)`;
          card.style.backgroundImage = `radial-gradient(420px circle at ${x.toFixed(0)}px ${y.toFixed(0)}px, ${lightBg(card) ? 'rgba(255,255,255,0.45)' : 'rgba(198,244,50,0.09)'}, transparent 65%)`;
        }
      }, { passive: true });
      const onLeave = () => { ring.style.opacity = '0'; releaseMag(); releaseCard(); };
      document.documentElement.addEventListener('mouseleave', onLeave);
      cleanups.push(() => { document.documentElement.removeEventListener('mouseleave', onLeave); cancelAnimationFrame(raf); });
    }

    return () => cleanups.forEach(f => f());
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(198,244,50,0.8)', zIndex: 190, pointerEvents: 'none', opacity: 0, transform: 'translate(-100px,-100px)', transition: 'width .35s cubic-bezier(.5,1.6,.4,1),height .35s cubic-bezier(.5,1.6,.4,1),background .3s,border-color .3s,opacity .3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span ref={labRef} style={{ fontSize: 12, fontWeight: 700, color: '#0E0F12', opacity: 0, transition: 'opacity .2s', whiteSpace: 'nowrap' }}>შემდეგი</span>
      </div>
      <div ref={idleRef} className="eg-idle" aria-hidden="true">
        <span className="eg-zz" style={{ left: 14, top: -22, fontSize: 14 }}>z</span>
        <span className="eg-zz" style={{ left: 20, top: -30, fontSize: 18, animationDelay: '.55s' }}>Z</span>
        <div ref={codeRef} className="eg-code"><span /><i /></div>
      </div>
      <div ref={barRef} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, right: 0, height: 3, background: '#C6F432', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 120, pointerEvents: 'none' }} />
    </>
  );
}
