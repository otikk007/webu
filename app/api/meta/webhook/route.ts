import { answer, answerNonText, signatureValid, verifyToken } from '@/lib/meta';

export const runtime = 'nodejs';

// Facebook Messenger webhook for the webugeo Page (see lib/meta).

// Subscription check from the Meta app dashboard: echo hub.challenge back.
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  if (p.get('hub.mode') === 'subscribe' && verifyToken(p.get('hub.verify_token'))) {
    return new Response(p.get('hub.challenge') ?? '', { headers: { 'content-type': 'text/plain' } });
  }
  return new Response(null, { status: 403 });
}

type Messaging = {
  sender?: { id?: string };
  message?: { is_echo?: boolean; text?: string; quick_reply?: { payload?: string }; attachments?: unknown[] };
  postback?: { title?: string; payload?: string };
};

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 1_000_000) return new Response(null, { status: 413 });
  if (!signatureValid(raw, req.headers.get('x-hub-signature-256'))) return new Response(null, { status: 401 });

  let body: { object?: string; entry?: { messaging?: Messaging[] }[] };
  try { body = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
  if (body.object !== 'page') return new Response(null, { status: 404 });

  // Answer every message, then 200: Meta resends anything not acknowledged.
  for (const entry of body.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const psid = ev.sender?.id;
      if (!psid || ev.message?.is_echo) continue;
      // The "Get Started" button sends a postback, answered like a greeting.
      const postback = ev.postback && (ev.postback.payload === 'GET_STARTED' ? 'გამარჯობა' : ev.postback.title ?? ev.postback.payload);
      const text = ev.message?.quick_reply?.payload ?? ev.message?.text ?? postback;
      if (text) await answer(psid, text);
      else if (ev.message?.attachments?.length) await answerNonText(psid);
    }
  }
  return new Response('EVENT_RECEIVED');
}
