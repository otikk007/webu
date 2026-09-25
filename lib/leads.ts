import 'server-only';
import { del, get, list, put } from '@vercel/blob';

// Leads are stored as one private JSON blob each: leads/<id>.json.
// Ids start with a timestamp, so sorting by pathname sorts by date.

export type LeadStatus = 'new' | 'done';

export type AuditLead = {
  type: 'audit';
  url: string;
  email: string;
  scores: number[];
  issues: string[];
};

export type BookingLead = {
  type: 'booking';
  name: string;
  contact: string;
  date: string;
  time: string;
};

export type Lead = (AuditLead | BookingLead) & { id: string; createdAt: string; status: LeadStatus };

const PREFIX = 'leads/';
const path = (id: string) => `${PREFIX}${id}.json`;

async function write(lead: Lead) {
  await put(path(lead.id), JSON.stringify(lead), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function read(pathname: string): Promise<Lead | null> {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res) return null;
  return JSON.parse(await new Response(res.stream).text()) as Lead;
}

export async function saveLead(data: AuditLead | BookingLead) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const lead = { ...data, id, createdAt: new Date().toISOString(), status: 'new' } as Lead;
  await write(lead);
  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor });
    paths.push(...page.blobs.map(b => b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  const leads = await Promise.all(paths.map(read));
  return leads.filter((l): l is Lead => !!l).sort((a, b) => b.id.localeCompare(a.id));
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const lead = await read(path(id));
  if (lead) await write({ ...lead, status });
}

export async function deleteLead(id: string) {
  await del(path(id));
}

export const isLeadId = (id: string) => /^\d{13}-[a-z0-9]{1,8}$/.test(id);
