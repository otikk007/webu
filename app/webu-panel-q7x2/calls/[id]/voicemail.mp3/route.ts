import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { isAdmin } from '@/lib/admin-auth';
import { callById, markListened, voicemailPath } from '@/lib/pbx';

export const dynamic = 'force-dynamic';

// Plays a call's voicemail for a signed-in admin. Supports Range requests so the
// browser's <audio> can seek; the first request marks the message as listened.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response(null, { status: 401 });

  const id = Number((await params).id);
  const call = Number.isInteger(id) && id > 0 ? await callById(id) : null;
  const path = call?.voicemail_file ? voicemailPath(call.voicemail_file) : null;
  const info = path ? await stat(path).catch(() => null) : null;
  if (!call || !path || !info) return new Response(null, { status: 404 });

  const size = info.size;
  const etag = `"${size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const headers: Record<string, string> = {
    'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', ETag: etag,
    'Last-Modified': info.mtime.toUTCString(), 'Cache-Control': 'private, no-cache',
  };
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });

  await markListened(call.id);

  let start = 0, end = size - 1, status = 200;
  const range = req.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && (range[1] || range[2])) {
    if (range[1]) { start = Number(range[1]); if (range[2]) end = Math.min(Number(range[2]), size - 1); }
    else start = Math.max(0, size - Number(range[2]));  // suffix range: last N bytes
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = String(end - start + 1);

  const body = Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream;
  return new Response(body, { status, headers });
}
