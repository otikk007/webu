'use client';

import { useEffect, useRef, useState } from 'react';
import { egg, eggText } from '@/lib/eggs-text';
import { lp, type Lang } from '@/lib/i18n';

const CHARS = 'ა ბ გ დ ე ვ ზ თ ი კ ლ მ ნ ო პ ჟ რ ს ტ უ ფ ქ ღ ყ შ ჩ ც ძ წ ჭ ხ ჯ ჰ 0 1 w e b u < / >'.split(' ');

// /matrix: Georgian digital rain, a typed wake-up line and two pills.
export default function MatrixScreen({ lang }: { lang: Lang }) {
  const t = eggText(lang).matrix;
  const cv = useRef<HTMLCanvasElement>(null);
  const [n, setN] = useState(0);

  // Delayed so EggsProvider (a parent, whose effects run later) is already listening.
  useEffect(() => { const id = setTimeout(() => egg('url'), 400); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const id = setInterval(() => setN(v => (v >= t.wake.length + 8 ? (clearInterval(id), v) : v + 1)), 90);
    return () => clearInterval(id);
  }, [t.wake]);

  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext('2d')!;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let fs = 18, cols = 0, drops: number[] = [], raf = 0, last = 0;
    const size = () => {
      const d = devicePixelRatio || 1;
      c.width = c.clientWidth * d; c.height = c.clientHeight * d;
      fs = 18 * d; cols = Math.ceil(c.width / fs);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
    };
    const frame = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${fs}px 'JetBrains Mono', 'Noto Sans Georgian', monospace`;
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fs;
        ctx.fillStyle = Math.random() < 0.04 ? '#F2F1EC' : i % 7 === 0 ? '#8B6CFF' : '#C6F432';
        ctx.fillText(CHARS[(Math.random() * CHARS.length) | 0], i * fs, y);
        if (y > c.height && Math.random() > 0.975) drops[i] = 0; else drops[i]++;
      }
    };
    const loop = (ts: number) => { raf = requestAnimationFrame(loop); if (ts - last < 50) return; last = ts; frame(); };
    size();
    addEventListener('resize', size);
    if (still) { for (let k = 0; k < 40; k++) frame(); } else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); };
  }, []);

  const done = n >= t.wake.length + 6;
  return (
    <main className="eg-matrix">
      <canvas ref={cv} aria-hidden="true" />
      <div className="eg-matrix-in">
        <span className="eg-matrix-url">webu.ge/matrix</span>
        <h1 aria-label={t.wake}>{t.wake.slice(0, n)}<i aria-hidden="true" /></h1>
        {done && (
          <div className="eg-matrix-pick">
            <span>{t.pick}</span>
            <div>
              <a href={lp(lang, '/')} className="violet"><b aria-hidden="true" />{t.back}</a>
              <a href={`${lang === 'ka' ? '' : `/${lang}`}/#contact`} className="lime"><b aria-hidden="true" />{t.deep}</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
