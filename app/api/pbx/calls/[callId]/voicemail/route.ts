import { NextResponse } from 'next/server';
import { VM_MAX_BYTES, callByCallId, looksLikeMp3, pbxDenied, saveVoicemail } from '@/lib/pbx';

// Voicemail audio for a call already posted to /api/pbx/calls: multipart field `file` (MP3).
// The PBX retries on 404 (the call record may not have arrived yet).

const tooLarge = () => new Response(null, { status: 413 });

/** Reads the body, stopping as soon as it passes `max` bytes. */
async function readCapped(req: Request, max: number) {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request, { params }: { params: Promise<{ callId: string }> }) {
  const denied = pbxDenied(req);
  if (denied) return denied;

  const call = await callByCallId(decodeURIComponent((await params).callId));
  if (!call) return new Response(null, { status: 404 });

  // Room for the multipart headers around a file of up to VM_MAX_BYTES.
  const cap = VM_MAX_BYTES + 64 * 1024;
  if (Number(req.headers.get('content-length')) > cap) return tooLarge();
  const raw = await readCapped(req, cap);
  if (!raw) return tooLarge();

  const form = await new Response(raw, { headers: { 'content-type': req.headers.get('content-type') ?? '' } }).formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File) || file.size === 0) return new Response(null, { status: 400 });
  if (file.size > VM_MAX_BYTES) return tooLarge();
  const audio = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeMp3(audio)) return new Response(null, { status: 400 });

  await saveVoicemail(call, audio);
  return NextResponse.json({ ok: true });
}
