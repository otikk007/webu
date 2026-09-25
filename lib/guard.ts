import 'server-only';

// Lightweight abuse protection without external services.
// The rate limiter is in-memory per server instance: it stops bursts from one
// visitor, not a distributed attack (that needs Vercel Firewall or a captcha).

type Hit = { n: number; reset: number };
const buckets = new Map<string, Hit>();

/** Returns true while `key` has made fewer than `max` hits in the current window. */
export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const hit = buckets.get(key);
  if (!hit || hit.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  hit.n++;
  return hit.n <= max;
}

export function clear(key: string) {
  buckets.delete(key);
}

export function clientIp(h: Headers) {
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/** Rejects requests posted from other websites. Browsers always send Origin on POST. */
export function sameOrigin(h: Headers) {
  const origin = h.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === h.get('host'); } catch { return false; }
}
