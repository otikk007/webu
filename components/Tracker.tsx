'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

// Page-level analytics: page view with source, which sections get seen,
// what gets clicked, and time on page.
export default function Tracker() {
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    track('pageview', undefined, { r: document.referrer || undefined, us: q.get('utm_source') ?? undefined, uc: q.get('utm_campaign') ?? undefined });

    const seen = new Set<string>();
    const io = new IntersectionObserver(es => {
      for (const e of es) {
        const id = (e.target as HTMLElement).id;
        if (e.isIntersecting && !seen.has(id)) { seen.add(id); track('section', id); }
      }
    }, { rootMargin: '-45% 0px -45% 0px' }); // counts a section once it crosses the middle of the screen
    document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement).closest('a,button');
      if (!el || el.closest('[data-notrack]')) return;
      const text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const href = el.getAttribute('href') ?? '';
      const area = el.closest('header') ? 'მენიუ' : el.closest('footer') ? 'ფუტერი' : el.closest('section[id]')?.id ?? '';
      if (text) track('click', [area, text, href.startsWith('#') || !href ? '' : href].filter(Boolean).join(' · '));
    };
    document.addEventListener('click', onClick, { capture: true });

    const t0 = Date.now();
    let sent = false;
    const leave = () => {
      if (sent) return;
      sent = true;
      track('leave', [...seen].pop(), { v: Math.round((Date.now() - t0) / 1000) });
    };
    const onHide = () => { if (document.visibilityState === 'hidden') leave(); };
    addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      io.disconnect();
      document.removeEventListener('click', onClick, { capture: true });
      removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);
  return null;
}
