import 'server-only';
import { createHash } from 'node:crypto';
import { sql } from './db';

export const EVENT_TYPES = ['pageview', 'section', 'click', 'audit_run', 'audit_request', 'booking', 'price', 'leave'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|curl|wget|python|axios|node-fetch/i;

// Daily-rotating visitor hash: counts unique visitors without cookies or stored IPs.
export function visitorId(ip: string, ua: string) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${day}|${ip}|${ua}|${process.env.ADMIN_PASSWORD ?? ''}`).digest('hex').slice(0, 16);
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/(^|\.)yandex\./, 'Yandex'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)(chatgpt\.com|chat\.openai\.com)$/, 'ChatGPT'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity'],
  [/(^|\.)claude\.ai$/, 'Claude'],
  [/(^|\.)gemini\.google\.com$/, 'Gemini'],
  [/(^|\.)copilot\.microsoft\.com$/, 'Copilot'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'X'],
  [/(^|\.)(t\.me|telegram\.org)$/, 'Telegram'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)youtube\.com$/, 'YouTube'],
];

export function classifySource(referrer: string, utmSource: string, selfHost: string) {
  if (utmSource) return utmSource.slice(0, 40);
  if (!referrer) return 'პირდაპირი';
  let host: string;
  try { host = new URL(referrer).hostname.replace(/^www\./, ''); } catch { return 'პირდაპირი'; }
  if (host === selfHost.replace(/^www\./, '')) return 'პირდაპირი';
  if (host.startsWith('android-app')) return 'აპლიკაცია';
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host.slice(0, 60);
}

export function parseUa(ua: string) {
  const device = /iPad|Tablet/i.test(ua) ? 'ტაბლეტი' : /Mobi|Android|iPhone/i.test(ua) ? 'მობილური' : 'კომპიუტერი';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox'
    : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'სხვა';
  return { device, browser };
}

export type EventRow = {
  visitor: string; session: string; type: EventType; label: string | null; value: number | null;
  path: string | null; source: string | null; referrer: string | null; utm_campaign: string | null;
  country: string | null; city: string | null; device: string; browser: string;
};

export async function insertEvent(e: EventRow) {
  await sql`INSERT INTO events (visitor, session, type, label, value, path, source, referrer, utm_campaign, country, city, device, browser)
    VALUES (${e.visitor}, ${e.session}, ${e.type}, ${e.label}, ${e.value}, ${e.path}, ${e.source}, ${e.referrer}, ${e.utm_campaign}, ${e.country}, ${e.city}, ${e.device}, ${e.browser})`;
}
