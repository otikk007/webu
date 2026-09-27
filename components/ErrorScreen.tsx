'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Logo, SvgDefs } from '@/components/ui';
import '@/app/error-page.css';
import { hasLocale, lp, type Lang } from '@/lib/i18n';

// Error page (new/ERROR_PAGE.md, "Webu 404 v2"): a moving wall of cards that link
// to the real pages, a lime hero card with an animated "0", search, a rotating
// suggestion and a zoom transition into the chosen page.

type Code = '404' | '500' | '503';
type Card = { t: string; e: string; s: string; href: string; bg: string; fg: string; bd?: string; big?: string; img?: string; k: string };

const L = '#C6F432', V = '#8B6CFF', D = '#0E0F12', C = '#F2F1EC', K = '#17181D';

const COPY = {
  ka: {
    codes: { '404': ['ეს გვერდი სადღაც დაიკარგა.', 'სამაგიეროდ, აქ ყველა დანარჩენი გვერდია. აირჩიეთ რომელიმე ან მოძებნეთ.'], '500': ['რაღაც აირია. უკვე ვასწორებთ.', 'ჩვენს მხარეს მოხდა შეფერხება. სანამ ვასწორებთ, გადახედეთ სხვა გვერდებს.'], '503': ['საიტს ვაახლებთ. მალე დავბრუნდებით.', 'მიმდინარეობს გეგმიური განახლება. მანამდე აირჩიეთ სხვა გვერდი.'] },
    search: 'რას ეძებდით? საიტი, SEO, ფასი...', go: 'ძებნა', none: 'ვერაფერი ვიპოვეთ. სცადეთ „SEO“ ან „ფასი“.', home: 'მთავარზე დაბრუნება', hint: 'ან აირჩიეთ ნებისმიერი ბარათი ფონზე', maybe: 'იქნებ ამას ეძებდით?', poke: 'შემეხეთ',
    cards: [
      ['ვებსაიტები', '/website', 'საიტის დამზადება 499 ₾-დან', 'საიტი ვებ ვებგვერდი website'],
      ['აპლიკაციები', '/apps', 'iOS და Android', 'აპი აპლიკაცია app ios android მობილური'],
      ['SEO, AEO, GEO', '/seo', 'Google-სა და AI ძიებაში', 'seo google ოპტიმიზაცია aeo geo ai'],
      ['ნამუშევრები', '/work', 'შერჩეული პროექტები', 'პროექტი ნამუშევარი პორტფოლიო work'],
      ['ფასები', '/pricing', 'გაიგეთ სავარაუდო ბიუჯეტი', 'ფასი ფასები ღირებულება ბიუჯეტი price'],
      ['ონლაინ მაღაზია', '/shop', 'გადახდა ქართული ბანკებით', 'მაღაზია shop ecommerce'],
      ['UI/UX დიზაინი', '/design', 'გასაგები და მოსახერხებელი', 'დიზაინი ux ui design'],
      ['კონტაქტი', '/contact', '30-წუთიანი უფასო კონსულტაცია', 'კონტაქტი მოგვწერეთ კონსულტაცია contact'],
      ['SEO აუდიტი', '/audit', 'შეამოწმეთ საიტი უფასოდ', 'აუდიტი შემოწმება audit სიჩქარე'],
      ['ბლოგი', '/blog', 'გზამკვლევები და რჩევები', 'ბლოგი სტატია გზამკვლევი blog'],
      ['მთავარი', '/', 'დაიწყეთ თავიდან', 'მთავარი home'],
      ['Webu Care', '/care', 'მხარდაჭერა გაშვების შემდეგ', 'მხარდაჭერა care support'],
    ],
  },
  en: {
    codes: { '404': ['This page got lost somewhere.', 'Every other page is right here instead. Pick one or search.'], '500': ['Something went wrong. We are on it.', 'The problem is on our side. While we fix it, have a look at the other pages.'], '503': ['We are updating the site. Back soon.', 'Planned maintenance is in progress. Meanwhile, pick another page.'] },
    search: 'What were you looking for? Website, SEO, pricing...', go: 'Search', none: 'Nothing found. Try “SEO” or “pricing”.', home: 'Back to home', hint: 'or pick any card in the background', maybe: 'Were you looking for this?', poke: 'Poke me',
    cards: [
      ['Websites', '/website', 'Website development from 499 GEL', 'website web site landing'],
      ['Apps', '/apps', 'iOS and Android', 'app apps mobile ios android'],
      ['SEO, AEO, GEO', '/seo', 'On Google and in AI search', 'seo google aeo geo ai search'],
      ['Work', '/work', 'Selected projects', 'work projects portfolio'],
      ['Pricing', '/pricing', 'Estimate your budget', 'price pricing cost budget'],
      ['Online store', '/shop', 'Payments via Georgian banks', 'shop store ecommerce'],
      ['UI/UX design', '/design', 'Clear and easy to use', 'design ux ui'],
      ['Contact', '/contact', 'Free 30-minute consultation', 'contact consultation call'],
      ['SEO audit', '/audit', 'Check your site for free', 'audit check speed seo'],
      ['Blog', '/blog', 'Guides and advice', 'blog guides articles'],
      ['Home', '/', 'Start over', 'home'],
      ['Webu Care', '/care', 'Support after launch', 'care support maintenance'],
    ],
  },
  ru: {
    codes: { '404': ['Эта страница где-то потерялась.', 'Зато здесь все остальные страницы. Выберите любую или воспользуйтесь поиском.'], '500': ['Что-то пошло не так. Уже исправляем.', 'Сбой на нашей стороне. Пока исправляем, посмотрите другие страницы.'], '503': ['Обновляем сайт. Скоро вернёмся.', 'Идут плановые работы. А пока выберите другую страницу.'] },
    search: 'Что вы искали? Сайт, SEO, цены...', go: 'Найти', none: 'Ничего не нашли. Попробуйте «SEO» или «цены».', home: 'На главную', hint: 'или выберите любую карточку на фоне', maybe: 'Может, вы искали это?', poke: 'Нажми меня',
    cards: [
      ['Сайты', '/website', 'Разработка сайта от 499 ₾', 'сайт веб лендинг website'],
      ['Приложения', '/apps', 'iOS и Android', 'приложение мобильное ios android app'],
      ['SEO, AEO, GEO', '/seo', 'В Google и AI-поиске', 'seo google aeo geo ai поиск'],
      ['Работы', '/work', 'Избранные проекты', 'работы проекты портфолио'],
      ['Цены', '/pricing', 'Рассчитайте бюджет', 'цена цены стоимость бюджет'],
      ['Интернет-магазин', '/shop', 'Оплата через грузинские банки', 'магазин shop ecommerce'],
      ['UI/UX-дизайн', '/design', 'Понятно и удобно', 'дизайн ux ui'],
      ['Контакты', '/contact', 'Бесплатная консультация 30 минут', 'контакты консультация звонок'],
      ['SEO-аудит', '/audit', 'Проверьте сайт бесплатно', 'аудит проверка скорость seo'],
      ['Блог', '/blog', 'Гиды и советы', 'блог статьи гиды'],
      ['Главная', '/', 'Начать заново', 'главная home'],
      ['Webu Care', '/care', 'Поддержка после запуска', 'поддержка care'],
    ],
  },
} satisfies Record<Lang, unknown>;

const SLUGS: Record<Lang, Record<string, string>> = {
  ka: { website: '/saitis-damzadeba', apps: '/mobiluri-aplikaciis-shekmna', seo: '/seo-aeo-geo', shop: '/onlain-maghaziis-shekmna', care: '/webu-care' },
  en: { website: '/website-development', apps: '/mobile-app-development', seo: '/seo-aeo-geo', shop: '/online-store-development', care: '/webu-care' },
  ru: { website: '/razrabotka-sajta', apps: '/razrabotka-mobilnogo-prilozheniya', seo: '/seo-aeo-geo', shop: '/sozdanie-internet-magazina', care: '/webu-care' },
};
// Look of each card, in the same order as the copy above.
const LOOK: Omit<Card, 't' | 'e' | 's' | 'href' | 'k'>[] = [
  { bg: L, fg: D, big: 'Web' }, { bg: V, fg: C, big: 'App' }, { bg: C, fg: D, big: 'SEO' }, { bg: K, fg: C, img: '/assets/err/p1.webp' },
  { bg: K, fg: L, big: '₾', bd: 'rgba(198,244,50,0.35)' }, { bg: '#DDD4FF', fg: D, big: 'Shop' }, { bg: K, fg: C, img: '/assets/err/p2.webp' }, { bg: '#E6F8AE', fg: D, big: 'Hi!' },
  { bg: D, fg: C, big: 'Scan', bd: 'rgba(242,241,236,0.2)' }, { bg: L, fg: D, img: '/assets/err/p3.webp' }, { bg: V, fg: C, big: '404' }, { bg: K, fg: C, img: '/assets/err/p4.webp' },
];

function hrefFor(lang: Lang, e: string) {
  const anchor = (id: string) => `${lang === 'ka' ? '' : `/${lang}`}/#${id}`;
  const key = e.slice(1);
  if (SLUGS[lang][key]) return lp(lang, SLUGS[lang][key]);
  if (e === '/work') return anchor('work');
  if (e === '/pricing') return anchor('price');
  if (e === '/design') return anchor('services');
  if (e === '/contact') return anchor('contact');
  if (e === '/audit') return anchor('audit');
  if (e === '/blog') return lp(lang, '/blog');
  return lp(lang, '/');
}

const Arrow = ({ size = 14, w = 3 }: { size?: number; w?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></svg>
);

export default function ErrorScreen({ code = '404', langHint }: { code?: Code; langHint?: Lang }) {
  const [lang, setLang] = useState<Lang>(langHint ?? 'ka');
  const [vw, setVw] = useState(1280);
  const [intro, setIntro] = useState(true);
  const [m, setM] = useState([0, 0]);
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [sq, setSq] = useState(false);
  const [bursts, setBursts] = useState<{ s: number; c: string; dx: number; dy: number }[]>([]);
  const [si, setSi] = useState(0);
  const [pop, setPop] = useState(false);
  const [cyc, setCyc] = useState(0);
  const [zoom, setZoom] = useState<Card | null>(null);
  const [zin, setZin] = useState(false);
  const hold = useRef(false);
  const still = useRef(false);

  // not-found has no route params, so the language comes from the URL.
  useEffect(() => { if (!langHint) { const seg = location.pathname.split('/')[1]; if (hasLocale(seg)) setLang(seg); } }, [langHint]);

  const t = COPY[lang];
  const P: Card[] = useMemo(() => t.cards.map(([title, e, s, k], i) => ({ t: title, e, s, k, href: hrefFor(lang, e), ...LOOK[i] })), [t, lang]);

  useEffect(() => {
    still.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rs = () => setVw(innerWidth);
    rs(); addEventListener('resize', rs);
    const t1 = setTimeout(() => setIntro(false), still.current ? 0 : 700);
    return () => { removeEventListener('resize', rs); clearTimeout(t1); };
  }, []);

  // Suggestion popup cycle: in at 2.3s, 4.2s on screen, 420ms gap.
  useEffect(() => {
    let a: ReturnType<typeof setTimeout>, b: ReturnType<typeof setTimeout>;
    const show = () => { setPop(true); setCyc(c => c + 1); a = setTimeout(next, 4200); };
    const next = () => {
      if (hold.current) { a = setTimeout(next, 800); return; }
      setPop(false);
      b = setTimeout(() => { setSi(i => (i + 1) % 12); show(); }, 420);
    };
    a = setTimeout(show, 2300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    let raf = 0, pt = [0, 0];
    const move = (e: MouseEvent) => {
      pt = [e.clientX, e.clientY];
      if (raf || still.current) return;
      raf = requestAnimationFrame(() => { raf = 0; setM([pt[0] / innerWidth - 0.5, pt[1] / innerHeight - 0.5]); });
    };
    addEventListener('mousemove', move);
    return () => { removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  const go = (c: Card) => (ev?: React.SyntheticEvent) => {
    ev?.preventDefault();
    if (zoom) return;
    setZoom(c); setZin(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setZin(true)));
    setTimeout(() => { location.href = c.href; }, 850);
  };

  const poke = () => {
    const cl = [D, V, C];
    setBursts(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, d = 70 + Math.random() * 80; return { s: 7 + Math.random() * 12, c: cl[i % 3], dx: Math.cos(a) * d, dy: Math.sin(a) * d }; }));
    setSq(true); setTimeout(() => setSq(false), 180); setTimeout(() => setBursts([]), 820);
  };

  const mob = vw < 760, wide = vw >= 1180;
  const cw = mob ? 170 : 230, ncol = mob ? 5 : 7, hs = mob ? [200, 250, 220] : [260, 320, 280];
  const k = Math.max(-1, Math.min(1, m[0] * 2)), l = Math.max(-1, Math.min(1, m[1] * 2));
  const heroW = Math.min(mob ? vw - 28 : 540, 540);
  const qq = q.trim().toLowerCase();
  const results = qq ? P.filter(x => `${x.t} ${x.k} ${x.e}`.toLowerCase().includes(qq)).slice(0, 5) : [];
  const sug = P[si % P.length], side = cyc % 2 ? 1 : -1, popW = 300;
  const [title, body] = t.codes[code];
  const [c1, c3] = code === '404' ? ['4', '4'] : code === '500' ? ['5', '0'] : ['5', '3'];
  const bigSize = (b?: string) => (!b ? 40 : b.length > 3 ? (mob ? 30 : 42) : b.length > 2 ? (mob ? 40 : 56) : mob ? 54 : 72);

  return (
    <main className="er">
      <SvgDefs />
      <div className="er-stage" style={{ transform: `translate(${(-k * 26).toFixed(1)}px,${(-l * 18).toFixed(1)}px) scale(${intro ? 2.3 : 1})`, transition: intro ? 'none' : 'transform 1.4s cubic-bezier(.7,0,.2,1)' }}>
        <div className="er-wall" aria-hidden="true">
          {Array.from({ length: ncol }, (_, i) => {
            const list = Array.from({ length: 6 }, (_, j) => P[(i * 5 + j * 7) % P.length]);
            return (
              <div key={i} className="er-col" style={{ width: cw }}>
                <div className="er-col-in" style={{ animation: still.current ? 'none' : `${i % 2 ? 'erDown' : 'erUp'} ${52 + (i % 3) * 14}s linear infinite` }}>
                  {list.concat(list).map((c, j) => (
                    <a key={j} href={c.href} tabIndex={-1} onClick={go(c)} className="er-card" style={{ height: hs[(i + j) % 3], background: c.bg, color: c.fg, borderColor: c.bd ?? 'transparent' }}>
                      <div className="er-card-top"><span>{c.e}</span><span><i /><i /><i /></span></div>
                      {c.img ? <div className="er-card-img" style={{ backgroundImage: `url(${c.img})` }} /> : <div className="er-card-big" style={{ fontSize: bigSize(c.big) }}>{c.big}</div>}
                      <div className="er-card-bot"><span>{c.t}</span><span style={{ background: c.fg, color: c.bg }}><Arrow /></span></div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="er-vignette" aria-hidden="true" />

        <div className="er-hero-wrap" style={{ width: heroW }}>
          <div className="er-hero">
            <div className="er-hero-top">
              <a href={lp(lang, '/')} onClick={go(P[10])} className="er-logo"><Logo s={20} u="px" filter="goo-s" dur={4.5} ink /><span>webu</span></a>
              <span className="er-code">ERROR {code}</span>
            </div>
            <div className="er-digits">
              <span style={{ transform: `translate(${(-k * 10).toFixed(1)}px,${(-l * 6).toFixed(1)}px) rotate(${(-k * 6).toFixed(1)}deg)` }}>{c1}</span>
              <span className="er-zero">
                <button type="button" onClick={poke} aria-label={t.poke} style={{ transform: sq ? 'scale(1.15,.85)' : 'scale(1)' }}>
                  {[0, 1].map(e => <span key={e} className="er-eye"><span style={{ transform: `translate(${(k * 0.045).toFixed(3)}em,${(l * 0.05).toFixed(3)}em)` }} /></span>)}
                </button>
                {bursts.map((b, i) => <span key={i} className="er-burst" style={{ width: b.s, height: b.s, background: b.c, ['--x' as string]: `${b.dx}px`, ['--y' as string]: `${b.dy}px` }} />)}
              </span>
              <span style={{ transform: `translate(${(-k * 10).toFixed(1)}px,${(-l * 6).toFixed(1)}px) rotate(${(k * 6).toFixed(1)}deg)` }}>{c3}</span>
            </div>
            <div className="er-text"><h1>{title}</h1><p>{body}</p></div>
            <div className="er-search-wrap">
              <form className="er-search" style={{ borderColor: focus ? D : 'transparent' }} onSubmit={e => { e.preventDefault(); if (results[0]) go(results[0])(); }} role="search">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={D} strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder={t.search} aria-label={t.search} />
                <button type="submit">{t.go}</button>
              </form>
              {results.length > 0 && (
                <div className="er-results">
                  {results.map(r => <a key={r.e} href={r.href} onClick={go(r)}><span>{r.t}</span><span>{r.e}</span></a>)}
                </div>
              )}
              {qq && !results.length && <span className="er-none">{t.none}</span>}
            </div>
            <div className="er-cta">
              <a href={lp(lang, '/')} onClick={go(P[10])}>{t.home}<span><Arrow size={17} w={2.8} /></span></a>
              <span>{t.hint}</span>
            </div>
          </div>
        </div>
      </div>

      {wide && (
        <div className="er-pop" onMouseEnter={() => { hold.current = true; }} onMouseLeave={() => { hold.current = false; }}
          style={{ left: side > 0 ? `calc(50% + ${heroW / 2 + 36}px)` : `calc(50% - ${heroW / 2 + 36 + popW}px)`, top: `calc(50% - ${side > 0 ? 40 : 200}px)`, width: popW, transform: pop ? `translateY(0) rotate(${side * 3}deg) scale(1)` : `translateY(40px) rotate(${side * -8}deg) scale(.7)`, opacity: pop ? 1 : 0, pointerEvents: pop ? 'auto' : 'none' }}>
          <a href={sug.href} onClick={go(sug)}>
            <div className="er-pop-head"><span>{t.maybe}</span><span>{String(si % P.length + 1).padStart(2, '0')} / {P.length}</span></div>
            <div className="er-pop-media" style={{ background: sug.bg, color: sug.fg }}>
              {sug.img ? <div style={{ backgroundImage: `url(${sug.img})` }} /> : <span>{sug.big}</span>}
            </div>
            <div className="er-pop-foot"><div><strong>{sug.t}</strong><span>{sug.s}</span></div><span><Arrow size={18} w={2.8} /></span></div>
            <span className="er-pop-bar"><span key={cyc} style={{ animation: pop ? 'erTick 4.2s linear both' : 'none' }} /></span>
          </a>
        </div>
      )}

      <div className="er-zoom" aria-hidden={!zoom} style={{ background: zoom?.bg ?? L, color: zoom?.fg ?? D, transform: zin ? 'scale(1)' : 'scale(.2)', opacity: zoom ? 1 : 0, borderRadius: zin ? 0 : 60, pointerEvents: zoom ? 'auto' : 'none' }}>
        <span>{zoom?.t}</span>
      </div>
    </main>
  );
}
