import 'server-only';
import { sql } from './db';

// Chat questions for improving the assistant's data. Never throws.
export async function logChatQuestion(question: string, mode: string, intent: string, rejected: boolean) {
  try {
    await sql`INSERT INTO chat_questions (created_at, question, mode, intent, rejected)
      VALUES (${new Date().toISOString()}, ${question.slice(0, 500)}, ${mode}, ${intent || null}, ${rejected ? 1 : 0})`;
  } catch (e) {
    console.error('chat log failed', e);
  }
}

/** Questions the assistant did not answer (or answered wrongly), most frequent first. */
export async function unansweredQuestions(days: number) {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  try {
    const rows = await sql`SELECT question AS k, count(*) AS n, max(mode) AS mode FROM chat_questions
      WHERE created_at >= ${since} AND (mode != 'faq' OR rejected = 1)
      GROUP BY lower(question) ORDER BY 2 DESC, max(created_at) DESC LIMIT 25`;
    const total = await sql`SELECT count(*) AS n FROM chat_questions WHERE created_at >= ${since}`;
    return { total: Number(total[0]?.n ?? 0), rows: rows.map(r => ({ k: String(r.k), n: Number(r.n), mode: String(r.mode) })) };
  } catch {
    return { total: 0, rows: [] };
  }
}
