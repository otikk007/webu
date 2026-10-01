import { NextResponse } from 'next/server';
import { allow, clientIp, sameOrigin } from '@/lib/guard';
import { saveLead } from '@/lib/leads';
import { notify } from '@/lib/notify';

export const runtime = 'nodejs';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[\d\s()-]{9,20}$/;
const FAILED = 'მოთხოვნა ვერ გაიგზავნა. სცადეთ ხელახლა ან დარეკეთ: +995 32 219 22 70.';

const detail = (d: string, status: number) => NextResponse.json({ detail: d }, { status });
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// A request left in the chat: stored with the other leads (admin panel) and sent to
// the team's Telegram. Success is reported only if at least one of the two worked.
export async function POST(req: Request) {
  if (!sameOrigin(req.headers)) return detail('არასწორი მოთხოვნა.', 403);
  if (Number(req.headers.get('content-length') ?? 0) > 32_768) return detail('მოთხოვნა ძალიან დიდია.', 413);
  if (!allow(`chat-lead:${clientIp(req.headers)}`, 5, 60_000)) return detail('ძალიან ბევრი მოთხოვნაა. სცადეთ ერთ წუთში.', 429);

  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return detail('არასწორი მოთხოვნა.', 422);
  if (b.consent !== true) return detail('გთხოვთ, დაეთანხმოთ კონფიდენციალურობის პოლიტიკას.', 422);
  const name = str(b.name, 80);
  if (!name) return detail('მიუთითეთ სახელი.', 422);
  const contact = str(b.contact, 120);
  const phoneOk = PHONE.test(contact) && contact.replace(/\D/g, '').length >= 9;
  if (!EMAIL.test(contact) && !phoneOk) return detail('მიუთითეთ სწორი ტელეფონის ნომერი ან ელფოსტა.', 422);
  const need = str(b.need, 1000);
  const interests = Array.isArray(b.interests) ? b.interests.map((i: unknown) => str(i, 100)).filter(Boolean).slice(0, 20) : [];
  const transcript = Array.isArray(b.transcript)
    ? b.transcript.slice(-12).map((m: { role?: unknown; content?: unknown }) => ({
      role: m?.role === 'user' ? 'user' as const : 'assistant' as const,
      content: str(m?.content, 500),
    })).filter((m: { content: string }) => m.content)
    : [];

  let stored = false;
  try {
    await saveLead({ type: 'chat', name, contact, need, interests, transcript, lang: 'ka' });
    stored = true;
  } catch (e) {
    console.error('chat lead save failed', e);
  }

  const head = `ახალი მოთხოვნა (ჩატბოტი)\n${name}\n${contact}\n${need || '-'}\nთემები: ${interests.join(', ') || '-'}\n\nსაუბარი:\n`;
  let talk = transcript.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'კლიენტი' : 'ბოტი'}: ${m.content}`).join('\n');
  if (head.length + talk.length > 3800) talk = '…' + talk.slice(-(3800 - head.length));
  const delivered = await notify(head + talk);

  if (!stored && !delivered) return detail(FAILED, 503);
  return NextResponse.json({ ok: true });
}
