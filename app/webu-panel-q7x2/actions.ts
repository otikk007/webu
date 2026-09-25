'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { allow, clear, clientIp } from '@/lib/guard';
import { ADMIN_PATH, endSession, isAdmin, passwordMatches, startSession } from '@/lib/admin-auth';
import { deleteLead, isLeadId, setLeadStatus } from '@/lib/leads';

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const key = `login:${clientIp(await headers())}`;
  if (!allow(key, 5, 15 * 60_000)) return 'ძალიან ბევრი მცდელობა. სცადეთ 15 წუთში';
  const pw = String(form.get('password') ?? '');
  if (!passwordMatches(pw)) {
    await new Promise(r => setTimeout(r, 800));
    return 'პაროლი არასწორია';
  }
  clear(key);
  await startSession();
  revalidatePath(ADMIN_PATH);
  return null;
}

export async function logout() {
  await endSession();
  revalidatePath(ADMIN_PATH);
}

export async function toggleStatus(form: FormData) {
  if (!(await isAdmin())) return;
  const id = String(form.get('id') ?? ''), status = form.get('status') === 'done' ? 'done' : 'new';
  if (isLeadId(id)) await setLeadStatus(id, status);
  revalidatePath(ADMIN_PATH);
}

export async function removeLead(form: FormData) {
  if (!(await isAdmin())) return;
  const id = String(form.get('id') ?? '');
  if (isLeadId(id)) await deleteLead(id);
  revalidatePath(ADMIN_PATH);
}
