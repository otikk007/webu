import type { Metadata } from 'next';
import Link from 'next/link';
import { ADMIN_PATH, isAdmin } from '@/lib/admin-auth';
import { listLeads, type Lead } from '@/lib/leads';
import { logout, removeLead, toggleStatus } from './actions';
import LoginForm from './LoginForm';
import './admin.css';

export const metadata: Metadata = { title: 'Webu ადმინი', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const METRICS = ['სიჩქარე', 'ტექნიკური SEO', 'უსაფრთხოება', 'კონტენტი'];
const TABS = [
  { id: 'all', label: 'ყველა ახალი' },
  { id: 'booking', label: 'კონსულტაციები' },
  { id: 'audit', label: 'აუდიტის მოთხოვნები' },
  { id: 'done', label: 'დასრულებული' },
] as const;

const when = (iso: string) => new Date(iso).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const isEmail = (s: string) => s.includes('@');

function Card({ l }: { l: Lead }) {
  return (
    <article className={`adm-card${l.status === 'done' ? ' is-done' : ''}`}>
      <header>
        <span className={`adm-badge ${l.type}`}>{l.type === 'booking' ? 'კონსულტაცია' : 'აუდიტი'}</span>
        {l.status === 'new' && <span className="adm-new">ახალი</span>}
        <time dateTime={l.createdAt}>{when(l.createdAt)}</time>
      </header>
      {l.type === 'booking' ? (
        <dl>
          <dt>სახელი</dt><dd>{l.name}</dd>
          <dt>კონტაქტი</dt><dd><a href={isEmail(l.contact) ? `mailto:${l.contact}` : `tel:${l.contact.replace(/[^\d+]/g, '')}`}>{l.contact}</a></dd>
          <dt>შეხვედრა</dt><dd>{l.date}, {l.time}</dd>
        </dl>
      ) : (
        <>
          <dl>
            <dt>საიტი</dt><dd><a href={l.url} target="_blank" rel="noopener noreferrer nofollow">{l.url}</a></dd>
            <dt>ელფოსტა</dt><dd><a href={`mailto:${l.email}?subject=${encodeURIComponent('თქვენი საიტის აუდიტი | Webu')}`}>{l.email}</a></dd>
            <dt>ქულები</dt><dd>{l.scores.map((s, i) => `${METRICS[i]} ${s}`).join(' · ')}</dd>
          </dl>
          {l.issues.length > 0 && (
            <details>
              <summary>ნაპოვნი საკითხები ({l.issues.length})</summary>
              <ul>{l.issues.map(i => <li key={i}>{i}</li>)}</ul>
            </details>
          )}
        </>
      )}
      <footer>
        <form action={toggleStatus}>
          <input type="hidden" name="id" value={l.id} />
          <input type="hidden" name="status" value={l.status === 'new' ? 'done' : 'new'} />
          <button type="submit">{l.status === 'new' ? '✓ დასრულებულად მონიშვნა' : 'ახლად დაბრუნება'}</button>
        </form>
        <details className="adm-del">
          <summary>წაშლა</summary>
          <form action={removeLead}>
            <input type="hidden" name="id" value={l.id} />
            <button type="submit" className="danger">დიახ, წაშალე</button>
          </form>
        </details>
      </footer>
    </article>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await isAdmin())) {
    return <main className="adm"><LoginForm /></main>;
  }

  const { tab = 'all' } = await searchParams;
  const leads = await listLeads();
  const shown = leads.filter(l =>
    tab === 'done' ? l.status === 'done'
    : tab === 'booking' || tab === 'audit' ? l.type === tab && l.status === 'new'
    : l.status === 'new');
  const count = (id: string) => id === 'done' ? leads.filter(l => l.status === 'done').length
    : leads.filter(l => l.status === 'new' && (id === 'all' || l.type === id)).length;

  return (
    <main className="adm">
      <div className="adm-top">
        <h1>მოთხოვნები</h1>
        <form action={logout}><button type="submit" className="ghost">გასვლა</button></form>
      </div>
      <nav className="adm-tabs" aria-label="ფილტრი">
        {TABS.map(t => (
          <Link key={t.id} href={`${ADMIN_PATH}?tab=${t.id}`} aria-current={tab === t.id ? 'page' : undefined}>
            {t.label} <span>{count(t.id)}</span>
          </Link>
        ))}
      </nav>
      {shown.length ? (
        <div className="adm-list">{shown.map(l => <Card key={l.id} l={l} />)}</div>
      ) : (
        <p className="adm-empty">{tab === 'done' ? 'დასრულებული მოთხოვნები ჯერ არ არის.' : 'ახალი მოთხოვნები არ არის.'}</p>
      )}
    </main>
  );
}
