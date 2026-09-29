'use client';

import { useEffect, useRef, useState } from 'react';
import type { Dict } from '@/lib/dict';
import { fill } from '@/lib/i18n';
import { ADDONS, TYPES, fmt } from '@/lib/site';
import { track } from '@/lib/track';
import { Arrow } from './ui';

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Animates a number toward its target (700ms, ease-out cubic). */
function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 700), ez = 1 - Math.pow(1 - k, 3);
      cur.current = Math.round(from + (target - from) * ez);
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

export default function Price({ t }: { t: Dict['price'] }) {
  const [type, setType] = useState('corp');
  const [add, setAdd] = useState<Record<string, boolean>>({ seo: true });
  const typeLabel = (id: string) => t.types[id as keyof typeof t.types];
  const addonLabel = (id: string) => t.addons[id as keyof typeof t.addons];

  const sel = TYPES.find(x => x.id === type)!;
  const chosen = ADDONS.filter(a => add[a.id]);
  const total = sel.p + chosen.reduce((s, a) => s + a.p, 0);
  const wk = sel.w + chosen.reduce((s, a) => s + a.w, 0);
  // Prices are 12 x a round monthly amount, so the split is always whole.
  const monthly = total / 12;
  const shown = useCountUp(monthly);

  return (
    <section id="price" className="sec">
      <div className="inner">
        <h2 className="h2" style={{ marginBottom: 48 }}>{t.h2}</h2>
        <div className="grid">
          <div className="card r32 pr-left">
            <div className="pr-label">{t.need}</div>
            <div role="radiogroup" aria-label={t.typeLabel} className="pr-types">
              {TYPES.map(x => {
                const on = x.id === type;
                return (
                  <button key={x.id} type="button" role="radio" aria-checked={on} className="pr-type" onClick={() => { setType(x.id); track('price', typeLabel(x.id)); }}>
                    <span className="pr-type-top">
                      <span className="pr-type-name">{typeLabel(x.id)}</span>
                      <span className="pr-radio" aria-hidden="true" />
                    </span>
                    <span className="pr-type-meta">{fill(t.from, { p: fmt(x.p / 12) })} · {fill(t.weeksShort, { n: x.w })}</span>
                  </button>
                );
              })}
            </div>
            <div className="pr-label">{t.extra}</div>
            <div className="pr-addons">
              {ADDONS.map(a => {
                const on = !!add[a.id];
                return (
                  <button key={a.id} type="button" role="checkbox" aria-checked={on} className="pr-addon" onClick={() => { setAdd(p => ({ ...p, [a.id]: !p[a.id] })); if (!on) track('price', '+ ' + addonLabel(a.id)); }}>
                    <span className="pr-box" aria-hidden="true">{on && <Check />}</span>
                    <span className="pr-addon-name">{addonLabel(a.id)}</span>
                    <span className="pr-addon-price">+{fmt(a.p / 12)}{t.perMonth.replace(' ', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="r32 pr-total">
            <div className="pr-kicker">{t.budget}</div>
            <div aria-live="polite">
              <div className="pr-sum">{fmt(shown)}<span className="pr-per">{t.perMonth}</span></div>
              <div className="pr-monthly">{fill(t.total, { p: fmt(total) })}</div>
              <div className="pr-weeks">{fill(t.weeks, { n: wk })}</div>
            </div>
            <ul className="pr-perks">
              <li><Check />{t.perkHosting}</li>
              <li><Check />{t.perkInstall}</li>
            </ul>
            <div className="pr-break" aria-label={t.breakdown}>
              <div><span>{typeLabel(sel.id)}</span><span>{fmt(sel.p)}</span></div>
              {chosen.map(a => <div key={a.id}><span>{addonLabel(a.id)}</span><span>+{fmt(a.p)}</span></div>)}
            </div>
            <p className="pr-note">{t.note}</p>
            <a href="#contact" className="btn-dark pr-cta">
              <span>{t.cta}</span>
              <span className="pr-cta-arrow"><Arrow /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
