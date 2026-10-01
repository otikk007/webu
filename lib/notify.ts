import 'server-only';
import { ADMIN_PATH } from './admin-auth';
import { SITE_URL } from './site';

// Sends a Telegram message to the owner. Never throws: a failed notification
// must not lose the lead, which is already saved. Returns whether it was delivered.
export async function notify(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: `${text}\n\n${SITE_URL}${ADMIN_PATH}`,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('telegram', res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error('telegram failed', e);
    return false;
  }
}
