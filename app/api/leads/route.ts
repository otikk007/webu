import { NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== 'object') return bad('არასწორი მოთხოვნა');
  // Honeypot: real visitors never see or fill this field.
  if (str(b.website, 200)) return NextResponse.json({ ok: true });

  try {
    if (b.type === 'audit') {
      const email = str(b.email, 200), url = str(b.url, 300);
      if (!EMAIL.test(email)) return bad('ელფოსტა არასწორია');
      if (!url) return bad('საიტის მისამართი აკლია');
      const scores = Array.isArray(b.scores) ? b.scores.slice(0, 4).map(Number).filter(Number.isFinite) : [];
      const issues = Array.isArray(b.issues) ? b.issues.slice(0, 40).map((i: unknown) => str(i, 300)).filter(Boolean) : [];
      await saveLead({ type: 'audit', email, url, scores, issues });
      return NextResponse.json({ ok: true });
    }
    if (b.type === 'booking') {
      const name = str(b.name, 120), contact = str(b.contact, 200), date = str(b.date, 10), time = str(b.time, 5);
      if (!name) return bad('ჩაწერეთ სახელი');
      if (!EMAIL.test(contact) && contact.replace(/\D/g, '').length < 9) return bad('ჩაწერეთ ტელეფონი ან ელფოსტა');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return bad('აირჩიეთ დღე და დრო');
      await saveLead({ type: 'booking', name, contact, date, time });
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error('lead save failed', e);
    return NextResponse.json({ error: 'ვერ გაიგზავნა, სცადეთ თავიდან' }, { status: 500 });
  }
  return bad('არასწორი მოთხოვნა');
}
