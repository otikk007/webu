import { BOT_UA, classifySource, EVENT_TYPES, insertEvent, parseUa, visitorId, type EventType } from '@/lib/analytics';
import { ADMIN_COOKIE } from '@/lib/admin-auth';
import { allow, clientIp, sameOrigin } from '@/lib/guard';

// Analytics collector. Accepts text/plain too, because navigator.sendBeacon sends that.
const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const ok = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  const h = req.headers, ua = h.get('user-agent') ?? '';
  if (!sameOrigin(h) || BOT_UA.test(ua)) return ok();
  // The owner's own visits (signed in to the admin panel) are not counted.
  if (h.get('cookie')?.includes(`${ADMIN_COOKIE}=`)) return ok();
  const ip = clientIp(h);
  if (!allow(`t:${ip}`, 120, 60_000)) return ok();

  let b: Record<string, unknown>;
  try { b = JSON.parse(await req.text()); } catch { return ok(); }
  const type = b.type as EventType;
  const session = str(b.s, 40);
  if (!EVENT_TYPES.includes(type) || !session) return ok();

  const referrer = str(b.r, 300);
  const { device, browser } = parseUa(ua);
  const city = h.get('x-vercel-ip-city');
  try {
    await insertEvent({
      visitor: visitorId(ip, ua),
      session,
      type,
      label: str(b.l, 200),
      value: Number.isFinite(Number(b.v)) ? Math.max(0, Math.min(86400, Math.round(Number(b.v)))) : null,
      path: str(b.p, 200),
      source: type === 'pageview' ? classifySource(referrer ?? '', str(b.us, 40) ?? '', h.get('host') ?? '') : null,
      referrer: type === 'pageview' ? referrer : null,
      utm_campaign: str(b.uc, 80),
      country: h.get('x-vercel-ip-country'),
      city: city ? decodeURIComponent(city) : null,
      device,
      browser,
    });
  } catch (e) {
    console.error('analytics insert failed', e);
  }
  return ok();
}
