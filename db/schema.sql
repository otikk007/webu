-- Analytics events (Neon Postgres). Cookieless: `visitor` is a daily-rotating hash,
-- `session` is a random id kept in sessionStorage. No IPs or personal data are stored.
CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
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
