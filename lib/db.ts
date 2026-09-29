import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Neon Postgres over HTTP. Schema lives in db/schema.sql.
// Connected on first query, not at import, so builds and preview deployments
// without DATABASE_URL still work (queries then fail and callers handle it).
let client: NeonQueryFunction<false, false> | null = null;

export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) => {
  client ??= neon(process.env.DATABASE_URL!);
  return client(strings, ...values);
}) as NeonQueryFunction<false, false>;
