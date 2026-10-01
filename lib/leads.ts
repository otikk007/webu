import 'server-only';
import { sql } from './db';

// Leads are stored in the SQLite `leads` table, one JSON row each.
// Ids start with a timestamp, so sorting by id sorts by date.

export type LeadStatus = 'new' | 'done';

export type AuditLead = {
  type: 'audit';
  url: string;
  email: string;
  scores: number[];
  issues: string[];
  lang?: string;
};

export type BookingLead = {
  type: 'booking';
  name: string;
  contact: string;
  date: string;
  time: string;
  quote?: string;  // package picked in the price calculator
  lang?: string;
};

export type ChatLead = {
  type: 'chat';
  name: string;
  contact: string;
  need: string;
  interests: string[];
  transcript: { role: 'user' | 'assistant'; content: string }[];
  lang?: string;
};

export type Lead = (AuditLead | BookingLead | ChatLead) & { id: string; createdAt: string; status: LeadStatus };

const parse = (r: Record<string, unknown>) => ({ ...JSON.parse(String(r.data)), status: r.status }) as Lead;

export async function saveLead(data: AuditLead | BookingLead | ChatLead) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const lead = { ...data, id, createdAt: new Date().toISOString(), status: 'new' } as Lead;
  await sql`INSERT INTO leads (id, created_at, status, data) VALUES (${id}, ${lead.createdAt}, ${lead.status}, ${JSON.stringify(lead)})`;
  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  return (await sql`SELECT status, data FROM leads ORDER BY id DESC`).map(parse);
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  await sql`UPDATE leads SET status = ${status} WHERE id = ${id}`;
}

export async function deleteLead(id: string) {
  await sql`DELETE FROM leads WHERE id = ${id}`;
}

export const isLeadId = (id: string) => /^\d{13}-[a-z0-9]{1,8}$/.test(id);
