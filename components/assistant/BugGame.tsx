'use client';

import { useEffect, useRef } from 'react';
import { BOT_COLOR } from './Mascot';

const W = 600, H = 520, BEST = 'webu-game-best';

/** Mini game "დაიჭირე ბაგები" (AIBOT/desing §7): catch lime balls, dodge violet bugs, 3 lives. */
export default function BugGame() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const C = BOT_COLOR;
    let best = 0;
    try { best = Number(localStorage.getItem(BEST) || 0); } catch { /* private mode */ }
    type Item = { x: number; y: number; v: number; bug: boolean; r: number; sp: number };
    const g = { x: W / 2, tx: W / 2, items: [] as Item[], score: 0, best, lives: 3, t: 0, over: false, hit: 0, joy: 0, keys: {} as Record<string, number> };
    const reset = () => Object.assign(g, { items: [], score: 0, lives: 3, t: 0, over: false, hit: 0, joy: 0 });
    const toX = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * W; };
    const onMove = (e: PointerEvent) => { g.tx = toX(e); };
    const onDown = (e: PointerEvent) => { g.tx = toX(e); if (g.over) reset(); cv.focus(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { g.keys[e.key] = 1; e.preventDefault(); }
      if ((e.key === ' ' || e.key === 'Enter') && g.over) { reset(); e.preventDefault(); }
    };
    const onKeyUp = (e: KeyboardEvent) => { g.keys[e.key] = 0; };
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('keydown', onKey);
    cv.addEventListener('keyup', onKeyUp);

    const rr = (x: number, y: number, w: number, h: number, r: number) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
    const drawBot = (s: number) => {
      ctx.save(); ctx.scale(s, s); ctx.fillStyle = g.hit > 0 && (g.hit | 0) % 6 < 3 ? '#8B6CFF' : C;
      ctx.beginPath(); ctx.moveTo(-28, -32); ctx.ellipse(-28, 0, 27.5, 30, 0, Math.PI, Math.PI * 1.5); ctx.lineTo(-0.5, 0); ctx.lineTo(-0.5, -30); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0.5, -30); ctx.ellipse(28, 0, 27.5, 30, 0, Math.PI * 1.5, 0); ctx.lineTo(0.5, 0); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-29, 16, 21, 15.5, 0, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
      ctx.beginPath(); ctx.ellipse(29, 16, 21, 15.5, 0, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
      const eh = g.joy > 0 ? 4 : 9;
      [-15, 9].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex + 6, 25, 6, eh, 0, Math.PI, 0); ctx.fill(); });
      ctx.restore();
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      g.t++;
      if (g.keys.ArrowLeft) g.tx -= 14;
      if (g.keys.ArrowRight) g.tx += 14;
      g.tx = Math.max(60, Math.min(W - 60, g.tx)); g.x += (g.tx - g.x) * 0.22;
      const tilt = (g.tx - g.x) * 0.004;
      if (!g.over) {
        const lvl = 1 + g.score / 12;
        if (g.t % Math.max(18, 46 - g.score) === 0) g.items.push({ x: 40 + Math.random() * (W - 80), y: -30, v: 3 + Math.random() * 1.5 * lvl + lvl, bug: Math.random() < Math.min(0.42, 0.18 + g.score / 80), r: 0, sp: (Math.random() - 0.5) * 0.12 });
        g.items.forEach(it => { it.y += it.v; it.r += it.sp; });
        g.items = g.items.filter(it => {
          if (it.y > H - 112 && it.y < H - 40 && Math.abs(it.x - g.x) < 62) {
            if (it.bug) {
              g.lives--; g.hit = 36;
              if (g.lives <= 0) {
                g.over = true;
                if (g.score > g.best) { g.best = g.score; try { localStorage.setItem(BEST, String(g.best)); } catch { /* private mode */ } }
              }
            } else { g.score++; g.joy = 14; }
            return false;
          }
          return it.y < H + 40;
        });
      }
      if (g.hit > 0) g.hit--;
      if (g.joy > 0) g.joy--;
      ctx.fillStyle = '#0E0F12'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(242,241,236,0.06)';
      for (let x = 15; x < W; x += 30) for (let y = 15 + (g.t * 0.6) % 30 - 30; y < H; y += 30) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
      g.items.forEach(it => {
        ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.r);
        if (it.bug) {
          ctx.fillStyle = '#8B6CFF'; ctx.beginPath(); ctx.arc(0, 6, 20, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#0E0F12'; ctx.beginPath(); ctx.arc(-7, 0, 3.5, 0, 7); ctx.arc(7, 0, 3.5, 0, 7); ctx.fill();
          ctx.strokeStyle = '#8B6CFF'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-15, -22); ctx.moveTo(10, -12); ctx.lineTo(15, -22); ctx.stroke();
        } else {
          ctx.fillStyle = C; ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(14,15,18,0.25)'; ctx.beginPath(); ctx.arc(5, 5, 6, 0, 7); ctx.fill();
        }
        ctx.restore();
      });
      ctx.save(); ctx.translate(g.x, H - 70); ctx.rotate(tilt); drawBot(1 + (g.joy > 0 ? Math.sin(g.joy) * 0.05 : 0)); ctx.restore();
      ctx.font = '500 26px JetBrains Mono, monospace'; ctx.fillStyle = '#F2F1EC'; ctx.textAlign = 'left'; ctx.fillText(String(g.score).padStart(3, '0'), 26, 46);
      ctx.fillStyle = '#8C8C93'; ctx.font = '500 18px JetBrains Mono, monospace'; ctx.fillText('best ' + g.best, 26, 72);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < g.lives ? C : '#2A2B32'; ctx.beginPath(); ctx.arc(W - 36 - i * 30, 40, 10, Math.PI, 0); ctx.fill(); }
      if (g.over) {
        ctx.fillStyle = 'rgba(14,15,18,0.78)'; ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center'; ctx.fillStyle = C; ctx.font = '900 54px Noto Sans Georgian, sans-serif'; ctx.fillText(String(g.score), W / 2, H / 2 - 30);
        ctx.fillStyle = '#F2F1EC'; ctx.font = '800 28px Noto Sans Georgian, sans-serif'; ctx.fillText(g.score >= g.best && g.score > 0 ? 'ახალი რეკორდი!' : 'ბაგმა დაგიჭირა', W / 2, H / 2 + 14);
        ctx.fillStyle = C; rr(W / 2 - 110, H / 2 + 44, 220, 60, 20);
        ctx.fillStyle = '#0E0F12'; ctx.font = '800 24px Noto Sans Georgian, sans-serif'; ctx.fillText('თავიდან', W / 2, H / 2 + 83);
      }
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointermove', onMove);
      cv.removeEventListener('pointerdown', onDown);
      cv.removeEventListener('keydown', onKey);
      cv.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className="vb-game">
      <canvas ref={ref} width={W} height={H} tabIndex={0} aria-label="თამაში: დაიჭირე მწვანე ბურთები, აარიდე იისფერ ბაგებს. მართვა მაუსით, თითით ან ისრებით." />
    </div>
  );
}
