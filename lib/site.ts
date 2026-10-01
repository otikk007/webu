// Public address used for canonical URLs, sitemap, hreflang and JSON-LD.
// Defaults to the live domain so a build without NEXT_PUBLIC_SITE_URL never ships localhost.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://webu.ge').replace(/\/$/, '');

// Calculator prices (GEL) and timelines (weeks); labels live in the dictionaries.
// Every price is 12 x a round monthly amount, so the 12-month split is always a clean number.
export const TYPES = [
  { id: 'land', p: 480, w: 2 },
  { id: 'biz', p: 1200, w: 4 },
  { id: 'corp', p: 2280, w: 6 },
  { id: 'shop', p: 1920, w: 6 },
  { id: 'app', p: 3000, w: 8 },
  { id: 'mobile', p: 6000, w: 14 },
];

// Discounts: paying the whole project up front, and a client's second project.
export const PAY_IN_FULL_OFF = 0.1;
export const SECOND_PROJECT_OFF = 0.2;

export const ADDONS = [
  { id: 'seo', p: 360, w: 1 },
  { id: 'lang', p: 300, w: 1 },
  { id: 'admin', p: 720, w: 2 },
  { id: 'brand', p: 1200, w: 3 },
  { id: 'ai', p: 720, w: 2 },
  { id: 'analytics', p: 180, w: 0 },
];

// Project media; names and categories live in the dictionaries (work.items), same order.
// Home Work slider: the laptop showcase, then real client projects (lib/projects ids).
// `tag` is the small mono label on the right of each row.
export const WORKS = [
  { tag: '2026', src: '/assets/laptop-color.mp4', poster: '/assets/c-laptop-1280.webp' },
  { tag: 'service.fabra.ge', project: '01' },
  { tag: 'tevzao.ge', project: '02' },
  { tag: 'gemo.menu', project: '03' },
] as { tag: string; src?: string; poster?: string; project?: string }[];

// Official social profiles: footer links and JSON-LD sameAs.
export const SOCIAL = [
  { name: 'Facebook', url: 'https://www.facebook.com/webugeo' },
  { name: 'Instagram', url: 'https://www.instagram.com/webu.ge/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/webugeo/' },
];

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
