import { NextResponse } from 'next/server';
import { AuditError, runAudit } from '@/lib/audit';
import { allow, clientIp, sameOrigin } from '@/lib/guard';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!sameOrigin(req.headers)) return NextResponse.json({ error: 'არასწორი მოთხოვნა' }, { status: 403 });
  if (!allow(`audit:${clientIp(req.headers)}`, 8, 10 * 60_000) || !allow('audit:all', 300, 60 * 60_000)) {
    return NextResponse.json({ error: 'ძალიან ბევრი შემოწმებაა, სცადეთ რამდენიმე წუთში' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === 'string' ? body.url.slice(0, 300) : '';
  if (!url.trim()) return NextResponse.json({ error: 'ჩაწერეთ საიტის მისამართი' }, { status: 400 });
  try {
    return NextResponse.json(await runAudit(url));
  } catch (e) {
    const msg = e instanceof AuditError ? e.message : 'შემოწმება ვერ მოხერხდა, სცადეთ თავიდან';
    if (!(e instanceof AuditError)) console.error('audit failed', e);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
