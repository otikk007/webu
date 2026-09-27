import type { CSSProperties, ReactNode } from 'react';

export function Arrow({ size = 16, rot = 0 }: { size?: number; rot?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', flex: 'none', transform: `rotate(${rot}deg)` }}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Animated three-drop logo mark (§7.6). */
export function Logo({ s, u, filter, dur, ink }: { s: number; u: 'px' | 'em'; filter: 'goo-s' | 'goo-l'; dur: number; ink?: boolean }) {
  const main = ink ? '#0E0F12' : '#C6F432';
  const v = (n: number) => (n * s).toFixed(3) + u;
  const drop: CSSProperties = { position: 'absolute', borderRadius: '50%' };
  return (
    <span aria-hidden="true" style={{ position: 'relative', display: 'inline-block', width: v(1.95), height: v(1.2), filter: `url(#${filter})`, flex: 'none' }}>
      <span style={{ ...drop, left: 0, top: 0, width: v(1), height: v(1), background: main, animation: `lgA ${dur}s ease-in-out infinite` }} />
      <span style={{ ...drop, left: v(0.33), top: v(0.62), width: v(0.34), height: v(0.34), background: main, ['--f' as string]: v(0.32), animation: `lgC ${dur}s cubic-bezier(.5,0,.5,1) infinite` }} />
      <span style={{ ...drop, left: v(1.3), top: v(0.19), width: v(0.62), height: v(0.62), background: '#8B6CFF', ['--d' as string]: v(-0.58), animation: `lgB ${dur}s cubic-bezier(.65,0,.35,1) infinite` }} />
    </span>
  );
}

/** Liquid CTA wrapper (§7.1). The dot motion is driven globally by <Effects/>. */
export function Goo({ color, children, style }: { color: string; children: ReactNode; style?: CSSProperties }) {
  const dot = (d: number) => (
    <span data-dot="" style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, borderRadius: '50%', background: color, willChange: 'transform', transform: 'translate(-999px,0)' }} />
  );
  return (
    <div data-goo="" style={{ position: 'relative', display: 'inline-flex', ...style }}>
      <div style={{ position: 'absolute', inset: -170, filter: 'url(#goo)', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 170, background: color, borderRadius: 14 }} />
        {dot(28)}{dot(20)}{dot(14)}{dot(18)}
      </div>
      {children}
    </div>
  );
}

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="goo-s" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <filter id="goo-l" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <filter id="goo-a" x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C6F432" />
          <stop offset="1" stopColor="#8B6CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
