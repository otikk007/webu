'use client';

import type { CSSProperties } from 'react';
import type { Lang } from '@/lib/i18n';
import type { Project } from '@/lib/projects';

const Go = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6F432" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);

/** One project: browser frame with the real screen recording, then text and a link to the live site. */
export default function ProjectCard({ p, lang, n, total, meta, eager }: { p: Project; lang: Lang; n: number; total: number; meta: string; eager?: boolean }) {
  const t = p.text[lang];
  const pad = (v: number) => String(v).padStart(2, '0');
  const img = (style?: CSSProperties) => (
    <img src={p.media} alt={p.title} loading={eager ? 'eager' : 'lazy'} decoding="async" style={style} />
  );
  return (
    <article
      className="pj-card"
      style={{ background: p.bg, ['--glow' as string]: p.glow }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
      }}
    >
      <div className="pj-spot" aria-hidden="true" />
      <div className="pj-body">
        <div className="pj-media">
          <div className="pj-frame">
            <div className="pj-bar" aria-hidden="true">
              <span className="pj-dots"><span /><span /><span /></span>
              <span className="pj-url">{p.domain}</span>
            </div>
            {p.crop
              ? <div className="pj-shot" style={{ aspectRatio: p.crop.aspect, overflow: 'hidden' }}>{img({ position: 'absolute', left: p.crop.left, top: p.crop.top, width: p.crop.width, height: 'auto' })}</div>
              : <div className="pj-shot">{img()}</div>}
          </div>
        </div>
        <div className="pj-text">
          <div className="pj-top">
            <span className="pj-n">{pad(n)} / {pad(total)}</span>
            <div className="pj-tags">{t.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
          <div className="pj-copy">
            <h3>{p.title}</h3>
            <p>{t.desc}</p>
            <span className="pj-meta">{meta}</span>
          </div>
          <a href={p.url} target="_blank" rel="noopener" className="pj-cta">
            {p.label}
            <span className="pj-cta-arrow"><Go /></span>
          </a>
        </div>
      </div>
    </article>
  );
}
