import { NextResponse } from 'next/server';
import { logChatQuestion } from '@/lib/chat-log';
import { allow, clientIp, sameOrigin } from '@/lib/guard';
import { assistant, isIntent } from '@/lib/webu-assistant';

export const runtime = 'nodejs';

const detail = (d: string, status: number) => NextResponse.json({ detail: d }, { status });

// Stateless: the client sends the last answered intent (`previous`) and every intent
// answered so far (`seen`); the engine replies from faq-data.json only.
export async function POST(req: Request) {
  if (!sameOrigin(req.headers)) return detail('არასწორი მოთხოვნა.', 403);
  if (Number(req.headers.get('content-length') ?? 0) > 16_384) return detail('შეტყობინება ძალიან დიდია.', 413);
  if (!allow(`chat:${clientIp(req.headers)}`, 20, 60_000)) return detail('ძალიან ბევრი შეტყობინებაა. სცადეთ ერთ წუთში.', 429);

  const b = await req.json().catch(() => null);
  const message = typeof b?.message === 'string' ? b.message.trim() : '';
  if (!message || message.length > 2000) return detail('დაწერეთ შეკითხვა.', 422);
  const previous = isIntent(b?.previous) ? b.previous : null;
  const seen = Array.isArray(b?.seen) ? b.seen.filter((s: unknown): s is string => typeof s === 'string').slice(0, 50) : [];
  const rejected = b?.rejected === true;

  const reply = assistant().respond(message, previous, seen);
  await logChatQuestion(message, reply.mode, reply.intent, rejected);
  return NextResponse.json(reply);
}
