import { NextResponse } from 'next/server';
import { AuditError, runAudit } from '@/lib/audit';
import { allow, clientIp, sameOrigin } from '@/lib/guard';
import { langOf, msg } from '@/lib/messages';

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lang = langOf(body?.lang);
  if (!sameOrigin(req.headers)) return NextResponse.json({ error: msg('invalid', lang) }, { status: 403 });
  if (!allow(`audit:${clientIp(req.headers)}`, 8, 10 * 60_000) || !allow('audit:all', 300, 60 * 60_000)) {
    return NextResponse.json({ error: msg('tooManyChecks', lang) }, { status: 429 });
  }
  const url = typeof body?.url === 'string' ? body.url.slice(0, 300) : '';
  if (!url.trim()) return NextResponse.json({ error: msg('enterUrl', lang) }, { status: 400 });
  try {
    return NextResponse.json(await runAudit(url));
  } catch (e) {
    if (!(e instanceof AuditError)) console.error('audit failed', e);
    const error = e instanceof AuditError ? msg(e.key, lang, e.n) : msg('checkFailed', lang);
    return NextResponse.json({ error }, { status: 422 });
  }
}
