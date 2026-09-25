import type { Lang } from '@/lib/i18n';

// Inline SVG flags: emoji flags do not render on Windows (they show as letters).

const Georgia = () => (
  <>
    <rect width="30" height="20" fill="#fff" />
    <rect x="13" width="4" height="20" fill="#E8112D" />
    <rect y="8" width="30" height="4" fill="#E8112D" />
    {[[6.5, 4.5], [23.5, 4.5], [6.5, 15.5], [23.5, 15.5]].map(([x, y]) => (
      <path key={`${x}${y}`} d={`M${x - 0.8} ${y - 2.4}h1.6v1.6h1.6v1.6h-1.6v1.6h-1.6v-1.6h-1.6v-1.6h1.6z`} fill="#E8112D" />
    ))}
  </>
);

const UK = () => (
  <>
    <rect width="30" height="20" fill="#012169" />
    <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
    <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
    <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
    <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.4" />
  </>
);

const Russia = () => (
  <>
    <rect width="30" height="20" fill="#fff" />
    <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
    <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
  </>
);

const FLAGS: Record<Lang, () => React.ReactElement> = { ka: Georgia, en: UK, ru: Russia };

export default function Flag({ lang, size = 20 }: { lang: Lang; size?: number }) {
  const F = FLAGS[lang];
  const id = `flag-clip-${lang}`;
  return (
    <svg className="flag" width={size} height={(size * 2) / 3} viewBox="0 0 30 20" aria-hidden="true">
      <defs><clipPath id={id}><rect width="30" height="20" rx="3.5" /></clipPath></defs>
      <g clipPath={`url(#${id})`}><F /></g>
      <rect x="0.5" y="0.5" width="29" height="19" rx="3" fill="none" stroke="rgba(0,0,0,0.18)" />
    </svg>
  );
}
