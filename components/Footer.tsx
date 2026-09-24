import { NEON } from '@/lib/site';
import { Logo } from './ui';

export default function Footer() {
  return (
    <footer style={{ marginTop: 'clamp(72px,10vw,140px)', position: 'relative', overflow: 'hidden', background: '#0a0a0c' }}>
      <svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {NEON.map((n, i) => (
          <g key={i}>
            <path d={n.d} fill="none" stroke="#1f2027" strokeWidth={1.5} />
            <path d={n.d} fill="none" stroke={n.c} strokeWidth={2.5} strokeLinecap="round" pathLength={1000} strokeDasharray="80 1000" strokeDashoffset={1080} style={{ animation: `trace ${n.dur}s linear ${n.del}s infinite` }} />
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#0E0F12 0%,rgba(14,15,18,0) 30%,rgba(14,15,18,0) 60%,rgba(14,15,18,0.85) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: 'clamp(72px,10vw,140px) var(--pad-x) 32px', display: 'flex', justifyContent: 'center' }}>
        <div className="inner">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32, marginBottom: 'clamp(48px,8vw,120px)' }}>
            <address style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 17, fontStyle: 'normal' }}>
              <a href="tel:+995555123456">+995 555 12 34 56</a>
              <a href="mailto:hello@webu.ge">hello@webu.ge</a>
              <span style={{ color: '#9A9AA0' }}>თბილისი, ვაჟა ფშაველას 71</span>
            </address>
            <nav aria-label="ფუტერის ნავიგაცია" style={{ display: 'flex', gap: 40, flexWrap: 'wrap', fontSize: 15 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><a href="#services">სერვისები</a><a href="#work">ნამუშევრები</a><a href="#audit">SEO აუდიტი</a></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://behance.net" target="_blank" rel="noopener noreferrer">Behance</a>
              </div>
            </nav>
          </div>
          <div aria-label="webu" style={{ fontFamily: 'var(--unb)', fontSize: 'clamp(64px,19vw,300px)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.06em', display: 'flex', alignItems: 'center', gap: '0.12em', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex' }} aria-hidden="true">
              {'webu'.split('').map(c => <span key={c} data-letter="" style={{ display: 'inline-block', transition: 'color .3s' }}>{c}</span>)}
            </span>
            <Logo s={0.6} u="em" filter="goo-l" dur={6} />
          </div>
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 32, fontSize: 13, color: '#9A9AA0', fontFamily: 'var(--mono), var(--geo)' }}>
            <span>© 2026 Webu</span><span>კონფიდენციალურობა</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
