import { NextResponse } from 'next/server';
import { parseCall, pbxDenied, saveCall } from '@/lib/pbx';

// Call records from the office Asterisk PBX (token + IP allowlist, see lib/pbx).
export async function POST(req: Request) {
  const denied = pbxDenied(req);
  if (denied) return denied;

  const body = await req.json().catch(() => undefined);
  if (body === undefined) return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 });
  const parsed = parseCall(body);
  if ('error' in parsed) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });

  await saveCall(parsed.call);
  return NextResponse.json({ ok: true });
}
