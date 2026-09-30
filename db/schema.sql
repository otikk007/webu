-- Analytics events (SQLite). Cookieless: `visitor` is a daily-rotating hash,
-- `session` is a random id kept in sessionStorage. No IPs or personal data are stored.
-- `ts` is an ISO-8601 UTC string, so it sorts and compares as text.
CREATE TABLE IF NOT EXISTS events (
  id integer PRIMARY KEY AUTOINCREMENT,
  ts text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  visitor text NOT NULL,
  session text NOT NULL,
  type text NOT NULL,        -- pageview | section | click | audit_run | audit_request | booking | price | leave
  label text,
  value integer,             -- leave: seconds on page
  path text,
  source text,
  referrer text,
  utm_campaign text,
  country text,
  city text,
  device text,
  browser text
);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE INDEX IF NOT EXISTS events_type_ts ON events (type, ts);

-- Crawler visits (search and AI bots), written from proxy.ts.
CREATE TABLE IF NOT EXISTS crawls (
  id integer PRIMARY KEY AUTOINCREMENT,
  ts text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  bot text NOT NULL,
  path text
);
CREATE INDEX IF NOT EXISTS crawls_ts ON crawls (ts);

-- Leads from the booking and audit forms. `data` is the full Lead as JSON;
-- ids start with a timestamp, so sorting by id sorts by date.
CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  created_at text NOT NULL,
  status text NOT NULL DEFAULT 'new',  -- new | done
  data text NOT NULL
);
