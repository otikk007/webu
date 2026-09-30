import 'server-only';
import { sql } from './db';

// Aggregations for the admin analytics dashboard. Days are grouped in Tbilisi time (UTC+4, no DST).

export type Row = { k: string; n: number };
const rows = (r: Record<string, unknown>[]): Row[] => r.map(x => ({ k: String(x.k ?? '—'), n: Number(x.n) }));

export async function getStats(days: number) {
  const since = new Date(Date.now() - days * 86400_000).toISOString();

  const [kpi, daily, sources, sections, exits, clicks, devices, places, audits, funnel, recent] = await Promise.all([
    sql`SELECT
          count(DISTINCT visitor) FILTER (WHERE type = 'pageview') AS visitors,
          count(*) FILTER (WHERE type = 'pageview') AS views,
          count(DISTINCT session) AS sessions,
          round(avg(min(value, 1800)) FILTER (WHERE type = 'leave' AND value > 0)) AS avg_sec,
          count(*) FILTER (WHERE type IN ('audit_request', 'booking')) AS leads,
          count(*) FILTER (WHERE type = 'audit_run') AS audits
        FROM events WHERE ts >= ${since}`,
    sql`SELECT date(ts, '+4 hours') AS k, count(DISTINCT visitor) AS n
        FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 1`,
    sql`SELECT source AS k, count(DISTINCT visitor) AS n FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
    sql`SELECT label AS k, count(DISTINCT session) AS n FROM events WHERE type = 'section' AND ts >= ${since} GROUP BY 1`,
    sql`SELECT coalesce(label, 'top') AS k, count(*) AS n FROM events WHERE type = 'leave' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC`,
    sql`SELECT label AS k, count(*) AS n FROM events WHERE type = 'click' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    sql`SELECT device || ' · ' || browser AS k, count(DISTINCT visitor) AS n FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    sql`SELECT coalesce(city || ', ', '') || coalesce(country, '?') AS k, count(DISTINCT visitor) AS n FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    sql`SELECT label AS k, max(value) AS n, max(ts) AS ts FROM events WHERE type = 'audit_run' AND ts >= ${since} GROUP BY 1 ORDER BY 3 DESC LIMIT 20`,
    sql`WITH s AS (
          SELECT session,
            max(type = 'section' AND label = 'services') AS services,
            max(type IN ('audit_run', 'price') OR (type = 'click' AND label LIKE '%დაიწყეთ პროექტი%')) AS engaged,
            max(type IN ('audit_request', 'booking')) AS converted
          FROM events WHERE ts >= ${since} GROUP BY session HAVING max(type = 'pageview'))
        SELECT count(*) AS total, count(*) FILTER (WHERE services) AS services,
               count(*) FILTER (WHERE engaged) AS engaged, count(*) FILTER (WHERE converted) AS converted FROM s`,
    sql`SELECT ts, session, type, label, value, source, city, country, device FROM events WHERE ts >= ${since} ORDER BY ts DESC LIMIT 60`,
  ]);

  const k = kpi[0];
  const f = funnel[0];
  return {
    visitors: Number(k.visitors), views: Number(k.views), sessions: Number(k.sessions),
    avgSec: k.avg_sec == null ? null : Number(k.avg_sec), leads: Number(k.leads), audits: Number(k.audits),
    daily: rows(daily), sources: rows(sources), sections: rows(sections), exits: rows(exits), clicks: rows(clicks),
    devices: rows(devices), places: rows(places),
    auditSites: audits.map(a => ({ site: String(a.k), score: Number(a.n), ts: String(a.ts) })),
    funnel: [
      { k: 'შემოვიდა საიტზე', n: Number(f.total) },
      { k: 'ნახა სერვისები', n: Number(f.services) },
      { k: 'ჩაერთო (აუდიტი, ფასი ან „დაიწყეთ პროექტი“)', n: Number(f.engaged) },
      { k: 'გამოაგზავნა მოთხოვნა', n: Number(f.converted) },
    ],
    recent: recent.map(r => ({
      ts: String(r.ts), session: String(r.session), type: String(r.type), label: r.label as string | null,
      value: r.value as number | null, source: r.source as string | null,
      place: [r.city, r.country].filter(Boolean).join(', '), device: String(r.device),
    })),
  };
}
