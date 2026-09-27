import type { EggText } from '@/lib/eggs-text';

const X = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const CONFETTI = ['#8B6CFF', '#C6F432', '#0E0F12', '#FF6B4A', '#8B6CFF', '#C6F432', '#0E0F12', '#8B6CFF', '#C6F432', '#FF6B4A'];

/** The hidden-client easter egg: the project's "version history" plays out,
 *  two versions get struck out, the third is approved with a stamp and confetti. */
export default function ClientTip({ t }: { t: EggText['client'] }) {
  return (
    <span className="eg-tip" role="tooltip">
      <span className="eg-tip-head">{t.title}</span>
      {t.rows.map((r, i) => (
        <span key={r} className={`eg-tip-row${i < 2 ? ' is-no' : ' is-yes'}`} style={{ animationDelay: `${i * 0.45}s` }}>
          <b>v{i + 1}</b>
          <span className="eg-tip-txt" style={{ ['--strike-delay' as string]: `${i * 0.45 + 0.35}s` }}>{r}</span>
          <span className="eg-tip-mark" style={{ animationDelay: `${i * 0.45 + 0.35}s` }}>{i < 2 ? <X /> : <Check />}</span>
        </span>
      ))}
      <span className="eg-tip-foot">{t.foot}</span>
      <span className="eg-tip-stamp" aria-hidden="true">{t.stamp}</span>
      <span className="eg-tip-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => {
          const a = (i / CONFETTI.length) * Math.PI * 2 - Math.PI / 2;
          return <i key={i} style={{ background: c, ['--x' as string]: `${Math.cos(a) * (70 + (i % 3) * 18)}px`, ['--y' as string]: `${Math.sin(a) * (54 + (i % 2) * 20)}px`, ['--r' as string]: `${i * 47}deg` }} />;
        })}
      </span>
    </span>
  );
}
