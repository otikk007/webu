'use server';

import { revalidatePath } from 'next/cache';
import { endSession, isAdmin, passwordMatches, startSession } from '@/lib/admin-auth';
import { deleteLead, isLeadId, setLeadStatus } from '@/lib/leads';

export async function login(_: string | null, form: FormData): Promise<string | null> {
  const pw = String(form.get('password') ?? '');
  if (!passwordMatches(pw)) {
    await new Promise(r => setTimeout(r, 800));
    return 'პაროლი არასწორია';
  }
  await startSession();
  revalidatePath('/admin');
  return null;
}

export async function logout() {
  await endSession();
  revalidatePath('/admin');
}

export async function toggleStatus(form: FormData) {
  if (!(await isAdmin())) return;
  const id = String(form.get('id') ?? ''), status = form.get('status') === 'done' ? 'done' : 'new';
  if (isLeadId(id)) await setLeadStatus(id, status);
  revalidatePath('/admin');
}

export async function removeLead(form: FormData) {
  if (!(await isAdmin())) return;
  const id = String(form.get('id') ?? '');
  if (isLeadId(id)) await deleteLead(id);
  revalidatePath('/admin');
}
