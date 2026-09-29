import 'server-only';
import { sql } from './db';

// Crawler visits (search and AI bots), written from proxy.ts. The table is created
// on first use so no manual migration is needed. Never throws: logging must not
// affect the response.
let ready: Promise<unknown> | null = null;
const ensure = () => (ready ??= sql`CREATE TABLE IF NOT EXISTS crawls (
    id bigserial PRIMARY KEY,
    ts timestamptz NOT NULL DEFAULT now(),
    bot text NOT NULL,
    path text
  )`.then(() => sql`CREATE INDEX IF NOT EXISTS crawls_ts ON crawls (ts)`).catch(e => { ready = null; throw e; }));

export async function logCrawl(bot: string, path: string) {
  if (!process.env.DATABASE_URL) return;
  try {
    await ensure();
    await sql`INSERT INTO crawls (bot, path) VALUES (${bot}, ${path.slice(0, 200)})`;
  } catch (e) {
    console.error('crawl log failed', e);
  }
}

export type CrawlStats = {
  bots: { bot: string; n: number; last: string }[];
  pages: { k: string; n: number }[];
};

export async function getCrawlStats(days: number): Promise<CrawlStats> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  try {
    await ensure();
    const [bots, pages] = await Promise.all([
      sql`SELECT bot, count(*) AS n, max(ts) AS last FROM crawls WHERE ts >= ${since} GROUP BY bot ORDER BY 2 DESC`,
      sql`SELECT path AS k, count(*) AS n FROM crawls WHERE ts >= ${since} GROUP BY path ORDER BY 2 DESC LIMIT 12`,
    ]);
    return {
      bots: bots.map(b => ({ bot: String(b.bot), n: Number(b.n), last: String(b.last) })),
      pages: pages.map(p => ({ k: String(p.k), n: Number(p.n) })),
    };
  } catch {
    return { bots: [], pages: [] };
  }
}
