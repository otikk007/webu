import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { logChatQuestion } from './chat-log';
import { sql } from './db';
import { allow } from './guard';
import { assistant, isIntent } from './webu-assistant';

// The website assistant on Facebook Messenger (webugeo Page, Meta app "Webu_bot").
// Env (.env.local): META_VERIFY_TOKEN (webhook setup), META_APP_SECRET (request
// signatures), META_PAGE_TOKEN (Page access token for the Send API).

const GRAPH = 'https://graph.facebook.com/v23.0';
const MAX_TEXT = 2000;        // Send API limit per message
const MAX_QUICK = 13;         // quick replies per message
const MAX_QUICK_TITLE = 20;   // characters per quick reply title

export function verifyToken(token: string | null) {
  const want = process.env.META_VERIFY_TOKEN;
  return !!want && !!token && same(token, want);
}

/** Checks X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the App Secret). */
export function signatureValid(raw: string, header: string | null) {
  const secret = process.env.META_APP_SECRET;
  const got = header?.match(/^sha256=([0-9a-f]{64})$/i)?.[1];
  if (!secret || !got) return false;
  return same(got.toLowerCase(), createHmac('sha256', secret).update(raw).digest('hex'));
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

type Quick = { content_type: 'text'; title: string; payload: string };

async function send(psid: string, message: Record<string, unknown>) {
  const token = process.env.META_PAGE_TOKEN;
  if (!token) { console.error('messenger: META_PAGE_TOKEN is not set'); return; }
  try {
    const res = await fetch(`${GRAPH}/me/messages?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipient: { id: psid }, messaging_type: 'RESPONSE', message }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error('messenger send', res.status, await res.text());
  } catch (e) {
    console.error('messenger send failed', e);
  }
}

/** Splits a long answer at paragraph breaks so each part fits one message. */
function split(text: string) {
  const parts: string[] = [];
  let cur = '';
  for (const p of text.split('\n\n')) {
    const next = cur ? `${cur}\n\n${p}` : p;
    if (next.length <= MAX_TEXT) { cur = next; continue; }
    if (cur) parts.push(cur);
    cur = p.length <= MAX_TEXT ? p : p.slice(0, MAX_TEXT);
  }
  if (cur) parts.push(cur);
  return parts;
}

// A quick reply shows a short title; the full question travels in the payload.
const quick = (q: string): Quick => ({
  content_type: 'text',
  title: [...q].length > MAX_QUICK_TITLE ? `${[...q].slice(0, MAX_QUICK_TITLE - 1).join('')}…` : q,
  payload: q.slice(0, 1000),
});

async function context(psid: string) {
  const [r] = await sql`SELECT previous, seen FROM meta_chats WHERE psid = ${psid}`;
  const seen = r ? (JSON.parse(String(r.seen)) as unknown[]).filter((s): s is string => typeof s === 'string') : [];
  return { previous: r && isIntent(r.previous) ? String(r.previous) : null, seen };
}

/** Answers one Messenger message with the website's FAQ engine. */
export async function answer(psid: string, text: string) {
  const message = text.trim().slice(0, 2000);
  if (!message) return;
  if (!allow(`fb:${psid}`, 20, 60_000)) return;

  const { previous, seen } = await context(psid);
  const reply = assistant().respond(message, previous, seen);
  await logChatQuestion(message, reply.mode, reply.intent, false);

  if (reply.mode === 'faq' && reply.intent) {
    const next = (seen.includes(reply.intent) ? seen : [...seen, reply.intent]).slice(-50);
    await sql`INSERT INTO meta_chats (psid, previous, seen, updated_at) VALUES (${psid}, ${reply.intent}, ${JSON.stringify(next)}, ${new Date().toISOString()})
      ON CONFLICT(psid) DO UPDATE SET previous = excluded.previous, seen = excluded.seen, updated_at = excluded.updated_at`;
  }

  const links = reply.sources.map(s => `${s.title}: ${s.url}`).join('\n');
  const parts = split(links ? `${reply.answer}\n\n${links}` : reply.answer);
  const options = [...new Set([...reply.alternatives, ...reply.suggestions])].slice(0, MAX_QUICK).map(quick);
  for (const [i, part] of parts.entries()) {
    const last = i === parts.length - 1;
    await send(psid, last && options.length ? { text: part, quick_replies: options } : { text: part });
  }
}

/** Stickers, photos and voice messages: the engine only reads text. */
export async function answerNonText(psid: string) {
  if (!allow(`fb:${psid}`, 20, 60_000)) return;
  await send(psid, { text: 'ჯერჯერობით მხოლოდ ტექსტურ შეტყობინებებს ვკითხულობ. დამიწერეთ შეკითხვა ან დაგვიკავშირდით: hello@webu.ge · +995 32 219 22 70.' });
}
