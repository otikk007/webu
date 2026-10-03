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

-- Call history posted by the office Asterisk PBX after every call (POST /api/pbx/calls).
-- Times are UTC ISO strings like the rest of the file; call_id makes resends idempotent.
CREATE TABLE IF NOT EXISTS pbx_calls (
  id integer PRIMARY KEY AUTOINCREMENT,
  call_id text NOT NULL UNIQUE,
  started_at text,
  answered_at text,
  ended_at text,
  direction text,          -- inbound | outbound | internal
  caller text,
  callee text,
  lang text,               -- ka | en
  ivr_choice text,         -- "1" | "2" | "5" | "timeout"
  answered_by text,        -- extension, e.g. "101"
  status text,             -- answered | missed | voicemail | busy | abandoned_ivr | failed
  wait_seconds integer,
  talk_seconds integer,
  total_seconds integer,
  voicemail_mailbox text,
  voicemail_msg text,
  received_at text NOT NULL
  -- voicemail_file, voicemail_listened_at: added in lib/db.ts (ADDED_COLUMNS)
);
CREATE INDEX IF NOT EXISTS pbx_calls_started_at ON pbx_calls (started_at);
CREATE INDEX IF NOT EXISTS pbx_calls_caller ON pbx_calls (caller);
CREATE INDEX IF NOT EXISTS pbx_calls_status ON pbx_calls (status);

-- Questions asked in the chat assistant (no IP, no session, no contact data), so the
-- owner can add phrasings for questions it could not answer (mode clarify / fallback).
CREATE TABLE IF NOT EXISTS chat_questions (
  id integer PRIMARY KEY AUTOINCREMENT,
  created_at text NOT NULL,
  question text NOT NULL,
  mode text NOT NULL,       -- faq | clarify | fallback
  intent text,
  rejected integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chat_questions_created ON chat_questions (created_at);

-- Facebook Messenger conversations with the assistant: the engine is stateless,
-- so the context the website keeps in the browser (previous intent, intents
-- already answered) is kept here per Page-scoped user id.
CREATE TABLE IF NOT EXISTS meta_chats (
  psid text PRIMARY KEY,
  previous text,
  seen text NOT NULL DEFAULT '[]',  -- JSON array of intent ids
  updated_at text NOT NULL
);
