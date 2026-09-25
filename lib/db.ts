import 'server-only';
import { neon } from '@neondatabase/serverless';

// Neon Postgres over HTTP. Schema lives in db/schema.sql.
export const sql = neon(process.env.DATABASE_URL!);
