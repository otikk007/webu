'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';

export default function Serp({ t }: { t: Dict['serp'] }) {
  const rows = [
    { id: 'a', title: t.rival, url: '•••' },
    { id: 'b', title: t.rival, url: '•••' },
    { id: 'c', title: t.rival, url: '•••' },
    { id: 'me', title: t.you, url: t.yourUrl },
  ];
  const ref = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState(false);

  useEffect(() => {
    const el = ref.current?.closest('article');
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(es => {
      if (es[0].isIntersecting) { io.disconnect(); t = setTimeout(() => setUp(true), 500); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  const order = up ? ['me', 'a', 'b', 'c'] : ['a', 'b', 'c', 'me'];

  return (
    <div ref={ref} style={{ position: 'relative', height: 292 }} role="img" aria-label={t.label}>
      {rows.map(r => {
        const k = order.indexOf(r.id), me = r.id === 'me';
        return (
          <div key={r.id} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', borderRadius: 18, background: me && up ? '#C6F432' : '#fff', color: '#0E0F12', transform: `translateY(${k * 76}px)`, transition: 'transform 1.1s cubic-bezier(.6,0,.2,1),background .5s', transitionDelay: me ? '0s' : '.15s' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 14, width: 26, flex: 'none' }}>#{k + 1}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontFamily: 'var(--mono)' }}>{r.url}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
