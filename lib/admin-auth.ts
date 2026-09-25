import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'webu_admin';
// Must match the app/ folder name. Kept out of robots.txt on purpose so it isn't advertised.
export const ADMIN_PATH = '/webu-panel-q7x2';

// The session cookie is an HMAC of the admin password, so changing
// ADMIN_PASSWORD signs everyone out.
function token() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac('sha256', pw).update('webu-admin-session-v1').digest('hex');
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function passwordMatches(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  return !!pw && same(input, pw);
}

export async function isAdmin() {
  const t = token();
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!t && !!c && same(c, t);
}

export async function startSession() {
  (await cookies()).set(ADMIN_COOKIE, token()!, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

export async function endSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
