'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// The chat widget (and its CSS) is downloaded only after the page has loaded and the
// browser is idle, so it never competes with the first paint.
const Assistant = dynamic(() => import('./Assistant'), { ssr: false });

export default function AssistantLoader() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    let idle = 0, timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if ('requestIdleCallback' in window) idle = requestIdleCallback(() => setGo(true), { timeout: 2500 });
      else timer = setTimeout(() => setGo(true), 1200);
    };
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
    return () => {
      removeEventListener('load', start);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);
  return go ? <Assistant /> : null;
}
