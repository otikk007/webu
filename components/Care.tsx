import type { Dict } from '@/lib/dict';
import { Arrow } from './ui';

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Webu Care package: hosting (first 3 months free), what the package covers, and the 12-month payment split. */
export default function Care({ t, moreHref }: { t: Dict['care']; moreHref: string }) {
  return (
    <section id="care" className="sec">
      <div className="inner">
        <div className="head-row">
          <div style={{ flex: '1 1 560px' }}>
            <div className="pj-label" style={{ marginBottom: 18 }}>{t.label}</div>
            <h2 className="h2" style={{ maxWidth: 900 }}>{t.h2}</h2>
          </div>
          <p style={{ margin: 0, flex: '0 1 min(380px,100%)', minWidth: 0, color: '#9A9AA0', lineHeight: 1.6 }}>{t.lead}</p>
        </div>
        <div className="grid">
          <div className="r32 care-free">
            <div>
              <div className="care-big">{t.badge}</div>
              <div className="care-big-sub">{t.badgeText}</div>
            </div>
            <div>
              <p className="care-note">{t.badgeNote}</p>
              <p className="care-price">{t.price}</p>
            </div>
            <a href={moreHref} className="btn-dark care-cta">
              <span>{t.more}</span>
              <span className="pr-cta-arrow"><Arrow /></span>
            </a>
          </div>
          <div className="card r32 care-list">
            <div className="pr-label">{t.includesTitle}</div>
            <ul>
              {t.includes.map(i => <li key={i}><span className="care-tick"><Check /></span>{i}</li>)}
            </ul>
          </div>
          <div className="card r32 care-install">
            <div className="care-zero">{t.installBig}</div>
            <div>
              <h3>{t.installTitle}</h3>
              <p>{t.installText}</p>
            </div>
            <a href="#contact" className="btn-outline" style={{ alignSelf: 'flex-start' }}>{t.cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
