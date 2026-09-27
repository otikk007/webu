'use client';

import { useEffect, useState } from 'react';
import { PROMO, egg, eggText } from '@/lib/eggs-text';
import { lp, type Lang } from '@/lib/i18n';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'back'];
const Back = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }} aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
);

// /secret: a vault with a 4-digit code; behind the door is a promo code.
export default function VaultScreen({ lang }: { lang: Lang }) {
  const t = eggText(lang).vault;
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(0);
  const [copied, setCopied] = useState(false);

  // Delayed so EggsProvider (a parent, whose effects run later) is already listening.
  useEffect(() => { const id = setTimeout(() => egg('url'), 400); return () => clearTimeout(id); }, []);

  const press = (k: string) => {
    if (open) return;
    if (k === 'C') return setCode('');
    if (k === 'back') return setCode(c => c.slice(0, -1));
    const c = (code + k).slice(0, 4);
    setCode(c);
    if (c.length === 4) setTimeout(() => { if (c === PROMO.vault) setOpen(true); else { setShake(s => s + 1); setCode(''); } }, 250);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('back');
      else if (e.key === 'Escape') press('C');
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const copy = () => { navigator.clipboard?.writeText(PROMO.code).catch(() => {}); setCopied(true); };

  return (
    <main className="eg-vault">
      <a href={lp(lang, '/')} className="eg-vault-close" aria-label={t.close}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2F1EC" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </a>
      <div className="eg-vault-head">
        <span>webu.ge/secret</span>
        <h1>{open ? t.open : t.locked}</h1>
        <p>{open ? t.openSub : t.type}</p>
      </div>
      <div className="eg-vault-box">
        <div className="eg-vault-prize" aria-hidden={!open}>
          <span className="mono">{t.promo}</span>
          <strong>{PROMO.code}</strong>
          <span>{t.offer}</span>
          <button type="button" onClick={copy} tabIndex={open ? 0 : -1}>{copied ? t.copied : t.copy}</button>
        </div>
        <div className="eg-vault-door" style={{ transform: open ? 'rotateY(-112deg)' : 'none', animation: shake ? `${shake % 2 ? 'egShake' : 'egShakeB'} .45s both` : undefined }}>
          <div className="eg-vault-slots" aria-live="polite" aria-label={`${code.length} / 4`}>
            {[0, 1, 2, 3].map(i => <span key={i} className={code[i] ? 'on' : undefined}>{code[i] ? '•' : ''}</span>)}
          </div>
          <div className="eg-vault-pad">
            {KEYS.map(k => (
              <button key={k} type="button" className={k === 'C' || k === 'back' ? 'soft' : undefined} onClick={() => press(k)} aria-label={k === 'back' ? 'backspace' : k} tabIndex={open ? -1 : 0}>
                {k === 'back' ? <Back /> : k}
              </button>
            ))}
          </div>
        </div>
      </div>
      <span className="eg-vault-hint">{t.hint}</span>
    </main>
  );
}
