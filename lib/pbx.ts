import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sql } from './db';
import { clientIp } from './guard';

// Call history from the office Asterisk PBX (192.168.100.88): it posts one JSON
// record per finished call and resends it until it gets a 200, so saving is an upsert.

export const DIRECTIONS = ['inbound', 'outbound', 'internal'] as const;
export const STATUSES = ['answered', 'missed', 'voicemail', 'busy', 'abandoned_ivr', 'failed'] as const;

// No admin login on the PBX endpoints: a bearer token (PBX_API_TOKEN in .env.local)
// plus an allowlist of source addresses.
const ALLOWED_IPS = new Set(['192.168.100.88', '127.0.0.1', '::1']);

const tokenMatches = (header: string | null) => {
  const token = process.env.PBX_API_TOKEN;
  const got = header?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token || !got) return false;
  const a = Buffer.from(got), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** 403 for a foreign address, 401 for a wrong token, null when the PBX may proceed. */
export function pbxDenied(req: Request) {
  // Direct connections arrive as IPv4-mapped IPv6 (::ffff:192.168.100.88).
  const ip = clientIp(req.headers).replace(/^::ffff:/, '');
  if (!ALLOWED_IPS.has(ip)) return new Response(null, { status: 403 });
  if (!tokenMatches(req.headers.get('authorization'))) return new Response(null, { status: 401 });
  return null;
}

const TEXT = ['caller', 'callee', 'lang', 'ivr_choice', 'answered_by', 'voicemail_mailbox', 'voicemail_msg'] as const;
const TIMES = ['started_at', 'answered_at', 'ended_at'] as const;
const INTS = ['wait_seconds', 'talk_seconds', 'total_seconds'] as const;

export type Call = {
  id: number; call_id: string; started_at: string | null; answered_at: string | null; ended_at: string | null;
  direction: string | null; caller: string | null; callee: string | null; lang: string | null; ivr_choice: string | null;
  answered_by: string | null; status: string | null; wait_seconds: number | null; talk_seconds: number | null;
  total_seconds: number | null; voicemail_mailbox: string | null; voicemail_msg: string | null; received_at: string;
  voicemail_file: string | null; voicemail_listened_at: string | null;
};

type Fields = Omit<Call, 'id' | 'received_at' | 'voicemail_file' | 'voicemail_listened_at'>;

/** Checks a posted body; returns the row to save or an error message. Unknown fields are ignored. */
export function parseCall(b: unknown): { call: Fields } | { error: string } {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { error: 'body must be a JSON object' };
  const o = b as Record<string, unknown>;
  const missing = (k: string) => o[k] === undefined || o[k] === null;

  if (typeof o.call_id !== 'string' || !o.call_id.trim() || o.call_id.length > 128) return { error: 'call_id is required' };
  const call = { call_id: o.call_id.trim() } as Fields;

  for (const k of TEXT) {
    if (missing(k)) { call[k] = null; continue; }
    if (typeof o[k] !== 'string' || (o[k] as string).length > 64) return { error: `${k} must be a string` };
    call[k] = o[k] as string;
  }
  for (const k of TIMES) {
    if (missing(k)) { call[k] = null; continue; }
    const t = typeof o[k] === 'string' ? Date.parse(o[k] as string) : NaN;
    if (Number.isNaN(t)) return { error: `${k} must be an ISO 8601 date` };
    call[k] = new Date(t).toISOString();
  }
  for (const k of INTS) {
    if (missing(k)) { call[k] = null; continue; }
    if (!Number.isInteger(o[k]) || (o[k] as number) < 0) return { error: `${k} must be a non-negative integer` };
    call[k] = o[k] as number;
  }
  if (missing('direction')) call.direction = null;
  else if (!DIRECTIONS.includes(o.direction as never)) return { error: `direction must be one of ${DIRECTIONS.join(', ')}` };
  else call.direction = o.direction as string;
  if (missing('status')) call.status = null;
  else if (!STATUSES.includes(o.status as never)) return { error: `status must be one of ${STATUSES.join(', ')}` };
  else call.status = o.status as string;

  return { call };
}

export async function saveCall(c: Fields) {
  await sql`INSERT INTO pbx_calls (call_id, started_at, answered_at, ended_at, direction, caller, callee, lang, ivr_choice,
      answered_by, status, wait_seconds, talk_seconds, total_seconds, voicemail_mailbox, voicemail_msg, received_at)
    VALUES (${c.call_id}, ${c.started_at}, ${c.answered_at}, ${c.ended_at}, ${c.direction}, ${c.caller}, ${c.callee}, ${c.lang},
      ${c.ivr_choice}, ${c.answered_by}, ${c.status}, ${c.wait_seconds}, ${c.talk_seconds}, ${c.total_seconds},
      ${c.voicemail_mailbox}, ${c.voicemail_msg}, ${new Date().toISOString()})
    ON CONFLICT(call_id) DO UPDATE SET
      started_at = excluded.started_at, answered_at = excluded.answered_at, ended_at = excluded.ended_at,
      direction = excluded.direction, caller = excluded.caller, callee = excluded.callee, lang = excluded.lang,
      ivr_choice = excluded.ivr_choice, answered_by = excluded.answered_by, status = excluded.status,
      wait_seconds = excluded.wait_seconds, talk_seconds = excluded.talk_seconds, total_seconds = excluded.total_seconds,
      voicemail_mailbox = excluded.voicemail_mailbox, voicemail_msg = excluded.voicemail_msg, received_at = excluded.received_at`;
}

// Tbilisi is UTC+4 all year (no DST), so a local date maps to a fixed UTC range.
const dayStart = (date: string) => new Date(`${date}T00:00:00+04:00`).toISOString();
const nextDay = (date: string) => new Date(Date.parse(`${date}T00:00:00+04:00`) + 86_400_000).toISOString();
export const tbilisiToday = () => new Date(Date.now() + 4 * 3_600_000).toISOString().slice(0, 10);
const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export type CallFilter = { from?: string; to?: string; status?: string; lang?: string; q?: string; vm?: string };
export const PAGE_SIZE = 50;

export async function listCalls(f: CallFilter, page: number) {
  // Optional filters as "(? IS NULL OR ...)" so the statement stays a single tagged template.
  const from = isDate(f.from) ? dayStart(f.from!) : null;
  const to = isDate(f.to) ? nextDay(f.to!) : null;
  const status = STATUSES.includes(f.status as never) ? f.status! : null;
  const lang = f.lang === 'none' ? 'none' : f.lang === 'ka' || f.lang === 'en' ? f.lang : null;
  const digits = f.q?.replace(/\D/g, '') || null;
  const like = digits && `%${digits}%`;
  const vm = f.vm === '1' ? 1 : null;
  const offset = (page - 1) * PAGE_SIZE;

  const [{ n }] = await sql`SELECT COUNT(*) AS n FROM pbx_calls
    WHERE (${from} IS NULL OR started_at >= ${from}) AND (${to} IS NULL OR started_at < ${to})
      AND (${status} IS NULL OR status = ${status})
      AND (${lang} IS NULL OR (${lang} = 'none' AND lang IS NULL) OR lang = ${lang})
      AND (${like} IS NULL OR caller LIKE ${like} OR callee LIKE ${like})
      AND (${vm} IS NULL OR status = 'voicemail' OR voicemail_file IS NOT NULL)`;
  const rows = await sql`SELECT * FROM pbx_calls
    WHERE (${from} IS NULL OR started_at >= ${from}) AND (${to} IS NULL OR started_at < ${to})
      AND (${status} IS NULL OR status = ${status})
      AND (${lang} IS NULL OR (${lang} = 'none' AND lang IS NULL) OR lang = ${lang})
      AND (${like} IS NULL OR caller LIKE ${like} OR callee LIKE ${like})
      AND (${vm} IS NULL OR status = 'voicemail' OR voicemail_file IS NOT NULL)
    ORDER BY started_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`;
  return { total: Number(n), calls: rows as Call[] };
}

export async function todayStats() {
  const day = tbilisiToday();
  const [r] = await sql`SELECT COUNT(*) AS total,
      SUM(status = 'answered') AS answered, SUM(status = 'missed') AS missed, SUM(status = 'voicemail') AS voicemail
    FROM pbx_calls WHERE started_at >= ${dayStart(day)} AND started_at < ${nextDay(day)}`;
  return { total: Number(r.total), answered: Number(r.answered ?? 0), missed: Number(r.missed ?? 0), voicemail: Number(r.voicemail ?? 0) };
}

export async function unlistenedCount() {
  const [r] = await sql`SELECT COUNT(*) AS n FROM pbx_calls WHERE voicemail_file IS NOT NULL AND voicemail_listened_at IS NULL`;
  return Number(r.n);
}

// Voicemail audio lives in data/pbx_voicemail/ (not public/, so only the admin route serves it).
const DATA = join(process.cwd(), 'data');
const VM_DIR = 'pbx_voicemail';
export const VM_MAX_BYTES = 15 * 1024 * 1024;

export async function callByCallId(callId: string) {
  return ((await sql`SELECT * FROM pbx_calls WHERE call_id = ${callId}`)[0] as Call | undefined) ?? null;
}

export async function callById(id: number) {
  return ((await sql`SELECT * FROM pbx_calls WHERE id = ${id}`)[0] as Call | undefined) ?? null;
}

// MP3 starts with an ID3 tag or an MPEG audio frame sync (11 set bits).
export const looksLikeMp3 = (b: Uint8Array) =>
  (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0);

/** Saves (or overwrites) a call's voicemail. The file name comes from the stored call_id only. */
export async function saveVoicemail(call: Call, audio: Uint8Array) {
  const safe = call.call_id.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '') || String(call.id);
  const rel = `${VM_DIR}/${safe}.mp3`;
  await mkdir(join(DATA, VM_DIR), { recursive: true });
  const tmp = join(DATA, `${rel}.tmp`);
  await writeFile(tmp, audio);
  await rename(tmp, join(DATA, rel));
  await sql`UPDATE pbx_calls SET voicemail_file = ${rel} WHERE id = ${call.id}`;
}

/** Absolute path of a stored voicemail, refusing anything outside data/pbx_voicemail. */
export function voicemailPath(rel: string) {
  const abs = join(DATA, rel);
  return abs.startsWith(join(DATA, VM_DIR) + '/') ? abs : null;
}

export async function markListened(id: number) {
  await sql`UPDATE pbx_calls SET voicemail_listened_at = ${new Date().toISOString()} WHERE id = ${id} AND voicemail_listened_at IS NULL`;
}

// The PBX may write the same number as 555586060, 0555586060 or 995555586060.
export const normNumber = (n: string | null) => (n ?? '').replace(/\D/g, '').replace(/^995/, '').replace(/^0+/, '');

const isMissed = (c: Call) => (c.status === 'missed' || c.status === 'voicemail') && c.direction !== 'outbound' && c.direction !== 'internal';

/**
 * Ids of missed / voicemail calls that were never followed by an answered inbound
 * call from that number or an outbound call to it.
 */
export async function unreturnedIds(calls: Call[]) {
  const missed = calls.filter(c => isMissed(c) && c.started_at && normNumber(c.caller));
  if (!missed.length) return new Set<number>();
  const since = missed.reduce((m, c) => (c.started_at! < m ? c.started_at! : m), missed[0].started_at!);
  const later = await sql`SELECT started_at, direction, caller, callee FROM pbx_calls
    WHERE started_at > ${since} AND ((direction = 'inbound' AND status = 'answered') OR direction = 'outbound')`;
  // Latest contact time per number.
  const last = new Map<string, string>();
  for (const r of later) {
    const num = normNumber(String(r.direction === 'outbound' ? r.callee : r.caller));
    const t = String(r.started_at);
    if (num && (last.get(num) ?? '') < t) last.set(num, t);
  }
  return new Set(missed.filter(c => (last.get(normNumber(c.caller)) ?? '') <= c.started_at!).map(c => c.id));
}
