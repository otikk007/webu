import type { CSSProperties } from 'react';

export type Mood = 'idle' | 'think' | 'happy' | 'wave' | 'sleep';
export const BOT_COLOR = '#C6F432';

const EASE = 'cubic-bezier(.3,1.5,.5,1)';

/**
 * The mascot "webu" (AIBOT/desing, WebuBot). Box = size × size*0.62, unit u = size/100.
 * Layers each own one transform: [data-vb-tilt] (cursor tilt) → body animation →
 * pieces + [data-vb-eyes] (cursor follow) → scan → squash (mood) → eyes (blink).
 */
export default function Mascot({ size, mood = 'idle', noIntro = false, color = BOT_COLOR }: { size: number; mood?: Mood; noIntro?: boolean; color?: string }) {
  const u = size / 100;
  const think = mood === 'think', happy = mood === 'happy', sleep = mood === 'sleep', wave = mood === 'wave';

  const piece = (st: CSSProperties, anim: string | null, delay: number, x: number, y: number): CSSProperties => ({
    position: 'absolute', background: color, ...st,
    ['--x' as string]: `${x * u}px`, ['--y' as string]: `${y * u}px`,
    animation: [noIntro ? null : `vbIn .8s ${EASE} ${delay}ms both`, anim].filter(Boolean).join(', ') || undefined,
  });
  const eye = (left: number): CSSProperties => ({
    position: 'absolute', left: left * u, top: 0, width: 12 * u, height: 9 * u, borderRadius: '999px 999px 0 0',
    background: color, transformOrigin: '50% 100%', animation: sleep ? undefined : 'vbBlink 4.2s infinite',
  });
  const body = happy ? `vbJelly .6s ease-out, vbHop .7s ${EASE} .1s 2` : sleep ? 'vbBreath 3.2s ease-in-out infinite' : noIntro ? undefined : 'vbIdle 3.6s ease-in-out 1.2s infinite';

  return (
    <span aria-hidden="true" data-vb-tilt={noIntro ? undefined : ''}
      style={{ position: 'relative', display: 'inline-block', flex: 'none', width: size, height: 62 * u, ['--u' as string]: `${u}px`, transformOrigin: '50% 90%', transition: 'transform .4s cubic-bezier(.3,1.4,.5,1)' }}>
      <span data-vb-body="" style={{ position: 'absolute', inset: 0, transformOrigin: '50% 100%', animation: body }}>
        <span style={piece({ left: 22 * u, top: 0, width: 27.5 * u, height: 30 * u, borderRadius: '100% 0 0 0', transformOrigin: '0 100%' }, think ? 'vbLidL 1.1s ease-in-out infinite' : null, 0, -30, -40)} />
        <span style={piece({ left: 50.5 * u, top: 0, width: 27.5 * u, height: 30 * u, borderRadius: '0 100% 0 0', transformOrigin: '100% 100%' }, think ? 'vbLidR 1.1s ease-in-out infinite' : null, 90, 30, -40)} />
        <span style={piece({ left: 0, top: 31 * u, width: 21 * u, height: 31 * u, borderRadius: '100% 0 0 100%', transformOrigin: '100% 50%' }, happy ? 'vbEarL .45s ease-in-out 3' : null, 180, -50, 0)} />
        <span style={piece({ left: 79 * u, top: 31 * u, width: 21 * u, height: 31 * u, borderRadius: '0 100% 100% 0', transformOrigin: '0 50%' }, wave ? 'vbEarR .8s ease-in-out infinite' : happy ? 'vbEarR .45s ease-in-out 3' : null, 270, 50, 0)} />
        <span data-vb-eyes="" data-u={u}
          style={{ position: 'absolute', left: 22 * u, top: 46 * u, width: 56 * u, height: 9 * u, transition: 'transform .18s ease-out', opacity: noIntro ? 1 : 0, animation: noIntro ? undefined : `vbIn .6s ${EASE} 420ms both` }}>
          <span style={{ position: 'absolute', inset: 0, animation: think ? 'vbScan 1.1s ease-in-out infinite' : undefined }}>
            <span style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 9 * u, transformOrigin: '50% 100%', transform: sleep ? 'scaleY(.16)' : happy ? 'scaleY(.55) translateY(-2px)' : 'none', transition: 'transform .3s' }}>
              <span style={eye(9)} />
              <span style={eye(35)} />
            </span>
          </span>
        </span>
        {sleep && [0, 1].map(i => (
          <span key={i} style={{ position: 'absolute', right: -4 * u, top: -6 * u, fontFamily: 'var(--mono)', fontWeight: 500, fontSize: (i ? 22 : 16) * u, color, animation: `vbZ 2.6s ${i * 1.3}s ease-out infinite`, opacity: 0 }}>z</span>
        ))}
      </span>
    </span>
  );
}
