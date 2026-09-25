import { NextResponse } from 'next/server';
import { AuditError, runAudit } from '@/lib/audit';

export const maxDuration = 60;

export async function POST(req: Request) {
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
