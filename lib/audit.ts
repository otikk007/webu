import 'server-only';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

// Quick site audit: fetches the page itself and checks SEO tags, security headers
// and content. Speed comes from Google PageSpeed when PAGESPEED_API_KEY is set,
// otherwise from the measured response time and page size.

export type AuditResult = { url: string; scores: [number, number, number, number]; issues: string[] };

import type { MessageKey } from './messages';

/** A failure the visitor should see; `key` selects the localized message. */
export class AuditError extends Error {
  constructor(public key: MessageKey, public n?: number) { super(key); }
}

const UA = 'Mozilla/5.0 (compatible; WebuAudit/1.0; +https://webu-khaki.vercel.app)';
const MAX_BYTES = 2_000_000;

export function normalizeUrl(input: string): URL {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u: URL;
  try { u = new URL(s); } catch { throw new AuditError('badUrl'); }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port))) throw new AuditError('badUrl');
  if (!u.hostname.includes('.') || isIP(u.hostname) || /(^|\.)(localhost|local|internal)$/i.test(u.hostname)) throw new AuditError('badUrl');
  u.hash = '';
  return u;
}

function isPrivate(ip: string) {
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivate(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function assertPublic(host: string) {
  let addrs: { address: string }[];
  try { addrs = await lookup(host, { all: true }); } catch { throw new AuditError('notFound'); }
  if (!addrs.length || addrs.some(a => isPrivate(a.address))) throw new AuditError('notFound');
}

type Fetched = { url: URL; status: number; headers: Headers; body: string; ms: number; bytes: number };

// Follows redirects manually so every hop is checked against private addresses.
async function fetchPage(start: URL, readBody = true, timeout = 10000): Promise<Fetched> {
  let url = start;
  const t0 = performance.now();
  for (let hop = 0; hop < 6; hop++) {
    await assertPublic(url.hostname);
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: AbortSignal.timeout(timeout) });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      await res.body?.cancel();
      url = normalizeUrl(new URL(loc, url).toString());
      continue;
    }
    let body = '', bytes = 0;
    if (readBody && res.body) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); bytes += value.length;
        if (bytes > MAX_BYTES) { await reader.cancel(); break; }
      }
      body = new TextDecoder().decode(Buffer.concat(chunks));
    } else {
      await res.body?.cancel();
    }
    return { url, status: res.status, headers: res.headers, body, ms: performance.now() - t0, bytes };
  }
  throw new AuditError('redirects');
}

async function exists(u: URL) {
  try { return (await fetchPage(u, false, 5000)).status === 200; } catch { return false; }
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const tag = (html: string, re: RegExp) => html.match(re)?.[1]?.trim() ?? '';
const meta = (html: string, key: string) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*>`, 'i'))?.[0] ?? '';
  return m.match(/content=["']([^"']*)["']/i)?.[1]?.trim() ?? '';
};

async function pagespeed(url: string): Promise<number | null> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
    const res = await fetch(api, { signal: AbortSignal.timeout(45000) });
    if (!res.ok) return null;
    const d = await res.json();
    const s = d?.lighthouseResult?.categories?.performance?.score;
    return typeof s === 'number' ? clamp(s * 100) : null;
  } catch { return null; }
}

export async function runAudit(input: string): Promise<AuditResult> {
  const start = normalizeUrl(input);
  let page: Fetched;
  try { page = await fetchPage(start); } catch (e) {
    if (e instanceof AuditError) throw e;
    throw new AuditError('noResponse');
  }
  if (page.status >= 400) throw new AuditError('httpError', page.status);

  const html = page.body, h = page.headers, final = page.url;
  const origin = final.origin;
  const issues: string[] = [];
  const check = (ok: boolean, pts: number, issue: string) => { if (!ok) issues.push(issue); return ok ? pts : 0; };

  const [robots, sitemap, httpRedirects, psi] = await Promise.all([
    exists(new URL('/robots.txt', origin)),
    exists(new URL('/sitemap.xml', origin)),
    (async () => {
      try { const r = await fetchPage(new URL(`http://${final.host}/`), false, 5000); return r.url.protocol === 'https:'; } catch { return false; }
    })(),
    pagespeed(final.toString()),
  ]);

  // Technical SEO
  const title = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = meta(html, 'description');
  const h1s = (html.match(/<h1[\s>]/gi) ?? []).length;
  const robotsMeta = meta(html, 'robots').toLowerCase() + ' ' + (h.get('x-robots-tag') ?? '').toLowerCase();
  let seo = 0;
  seo += check(!!title, 12, 'გვერდს არ აქვს სათაური (title)');
  seo += check(!title || (title.length >= 10 && title.length <= 70), 8, 'სათაურის (title) სიგრძე არ არის ოპტიმალური (10-70 სიმბოლო)');
  seo += check(!!desc, 10, 'არ არის meta description');
  seo += check(!desc || (desc.length >= 50 && desc.length <= 170), 5, 'meta description-ის სიგრძე არ არის ოპტიმალური (50-170 სიმბოლო)');
  seo += check(h1s >= 1, 10, 'გვერდზე არ არის H1 სათაური');
  seo += check(h1s <= 1, 5, 'გვერდზე რამდენიმე H1 სათაურია');
  seo += check(/<meta[^>]+name=["']viewport["']/i.test(html), 15, 'არ არის viewport meta, საიტი შეიძლება მობილურზე სწორად არ ჩანდეს');
  seo += check(/<html[^>]+lang=["'][a-z]/i.test(html), 5, 'html ელემენტზე არ არის მითითებული ენა (lang)');
  seo += check(/<link[^>]+rel=["']canonical["']/i.test(html), 10, 'არ არის canonical ბმული');
  seo += check(!robotsMeta.includes('noindex'), 10, 'გვერდი დახურულია ინდექსაციისთვის (noindex)');
  seo += check(robots, 5, 'არ არის robots.txt');
  seo += check(sitemap, 5, 'არ არის sitemap.xml');

  // Security
  const csp = h.get('content-security-policy') ?? '';
  let sec = 0;
  sec += check(final.protocol === 'https:', 35, 'საიტი არ იყენებს HTTPS-ს');
  sec += check(httpRedirects, 15, 'http:// ვერსია არ გადამისამართდება https://-ზე');
  sec += check(!!h.get('strict-transport-security'), 15, 'არ არის HSTS header');
  sec += check((h.get('x-content-type-options') ?? '').toLowerCase() === 'nosniff', 10, 'არ არის X-Content-Type-Options header');
  sec += check(!!h.get('x-frame-options') || csp.includes('frame-ancestors'), 10, 'არ არის clickjacking-ისგან დაცვა (X-Frame-Options)');
  sec += check(!!csp, 10, 'არ არის Content-Security-Policy');
  sec += check(!!h.get('referrer-policy'), 5, 'არ არის Referrer-Policy header');

  // Content
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const withAlt = imgs.filter(i => /\balt=["'][^"']+["']/i.test(i)).length;
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const words = text.split(/\s+/).filter(w => w.length > 1).length;
  let con = 0;
  con += check(!!meta(html, 'og:title'), 15, 'არ არის og:title (სოციალურ ქსელებში გაზიარებისთვის)');
  con += check(!!meta(html, 'og:image'), 15, 'არ არის og:image (გაზიარებისას სურათი არ გამოჩნდება)');
  con += check(!!meta(html, 'og:description'), 10, 'არ არის og:description');
  const altRatio = imgs.length ? withAlt / imgs.length : 1;
  if (altRatio < 1) issues.push(`${imgs.length - withAlt} სურათს აკლია alt ტექსტი`);
  con += 30 * altRatio;
  if (words < 300) issues.push('გვერდზე ცოტა ტექსტია (300 სიტყვაზე ნაკლები)');
  con += 20 * Math.min(1, words / 300);
  con += check(/<link[^>]+rel=["'][^"']*icon/i.test(html), 10, 'არ არის favicon');

  // Speed
  let speed: number;
  if (psi != null) {
    speed = psi;
    if (psi < 50) issues.push(`Google PageSpeed-ის მობილური ქულა დაბალია (${psi})`);
  } else {
    const ms = page.ms;
    speed = ms <= 600 ? 100 : ms >= 4000 ? 20 : 100 - ((ms - 600) / 3400) * 80;
    if (ms > 1500) issues.push(`სერვერი ნელა პასუხობს (${(ms / 1000).toFixed(1)} წმ)`);
    if (page.bytes > 500_000) {
      speed -= Math.min(20, (page.bytes - 500_000) / 75_000);
      issues.push(`HTML გვერდი მძიმეა (${Math.round(page.bytes / 1024)} KB)`);
    }
  }

  return { url: final.toString(), scores: [clamp(speed), clamp(seo), clamp(sec), clamp(con)], issues };
}
