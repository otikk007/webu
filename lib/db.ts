import 'server-only';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import Database from 'better-sqlite3';

// Local SQLite file (SQLITE_PATH, default data/webu.db). Schema lives in db/schema.sql
// and is applied on first query, not at import, so builds never touch the file.
// Timestamps are stored as ISO strings in UTC ("2026-09-30T12:00:00.000Z").
let db: Database.Database | null = null;

function open() {
  const file = process.env.SQLITE_PATH || join(process.cwd(), 'data', 'webu.db');
  mkdirSync(dirname(file), { recursive: true });
  const d = new Database(file);
  d.pragma('journal_mode = WAL');
  d.pragma('busy_timeout = 5000');
  d.exec(readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8'));
  return d;
}

export type SqlRow = Record<string, unknown>;

// Same tagged-template call shape as before: sql`SELECT ... WHERE x = ${v}` -> rows.
export async function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<SqlRow[]> {
  db ??= open();
  const stmt = db.prepare(strings.join('?'));
  const params = values.map(v => (v === undefined ? null : typeof v === 'boolean' ? Number(v) : v));
  if (stmt.reader) return stmt.all(...params) as SqlRow[];
  stmt.run(...params);
  return [];
}
