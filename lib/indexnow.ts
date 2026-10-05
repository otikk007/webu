import 'server-only';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sitemap from '@/app/sitemap';
import { SITE_URL } from './site';

// IndexNow: tells Bing, Yandex and other IndexNow engines that pages changed,
// instead of waiting for their next crawl. Google does not use IndexNow.
// The key is public by design: search engines fetch it from /<key>.txt (public/).
export const INDEXNOW_KEY = '5d53f26757303e9021d16b73fb925cc8';

const STATE = join(process.cwd(), 'data', 'indexnow.json');

// Build id of the build this server runs (the folder .next-slot points at, see next.config.ts).
function buildId() {
  try {
    const slot = existsSync('.next-slot') ? readFileSync('.next-slot', 'utf8').trim() : '.next';
    return readFileSync(join(process.cwd(), slot, 'BUILD_ID'), 'utf8').trim();
  } catch {
    return null;
  }
}

/** Submits every sitemap URL once per new build. Never throws. */
export async function indexNowAfterDeploy() {
  try {
    const id = buildId();
    const last = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')).buildId : null;
    if (!id || id === last) return;

    const host = new URL(SITE_URL).host;
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: sitemap().map(u => u.url) }),
      signal: AbortSignal.timeout(15_000),
    });
    // 200 = accepted, 202 = accepted, key check pending.
    if (res.ok) writeFileSync(STATE, JSON.stringify({ buildId: id, at: new Date().toISOString(), status: res.status }));
    else console.error('indexnow', res.status, await res.text());
  } catch (e) {
    console.error('indexnow failed', e);
  }
}
