export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

// Calculator prices (GEL) and timelines (weeks); labels live in the dictionaries.
export const TYPES = [
  { id: 'land', p: 499, w: 2 },
  { id: 'corp', p: 1499, w: 4 },
  { id: 'shop', p: 5200, w: 7 },
  { id: 'app', p: 1999, w: 10 },
];

export const ADDONS = [
  { id: 'seo', p: 699, w: 1 },
  { id: 'lang', p: 600, w: 1 },
  { id: 'admin', p: 1400, w: 2 },
  { id: 'brand', p: 1100, w: 2 },
];

// Project media; names and categories live in the dictionaries (work.items), same order.
export const WORKS = [
  { year: '2026', src: '/assets/laptop-color.mp4', poster: '/assets/c-laptop-1280.webp', vid: true },
  { year: '2025', src: '/assets/c-hero.jpg' },
  { year: '2025', src: '/assets/c-city.jpg' },
  { year: '2024', src: '/assets/c-sculpture.jpg' },
] as { year: string; src: string; poster?: string; vid?: boolean }[];

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₾';

export const NEON = (() => {
  const cols = ['#C6F432', '#8B6CFF', '#34E0FF', '#FF4FD8', '#FFB23F', '#4F7BFF'];
  let s = 7;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: 18 }, (_, i) => {
    const y = 30 + i * 38 + r() * 14, x0 = -60 + r() * 1100, a = 120 + r() * 260, b = 140 + r() * 320, dy = (r() < 0.5 ? -1 : 1) * (24 + r() * 50);
    return {
      d: `M${x0.toFixed(0)} ${y.toFixed(0)}H${(x0 + a).toFixed(0)}V${(y + dy).toFixed(0)}H${(x0 + a + b).toFixed(0)}`,
      c: cols[i % cols.length], dur: (4 + r() * 4).toFixed(2), del: (-r() * 8).toFixed(2),
    };
  });
})();
