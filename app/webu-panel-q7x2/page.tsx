import Link from 'next/link';
import { Fragment } from 'react';
import { ADMIN_PATH, isAdmin } from '@/lib/admin-auth';
import { listLeads, type Lead } from '@/lib/leads';
import { removeLead, toggleStatus } from './actions';
import AdminNav from './AdminNav';
import LoginForm from './LoginForm';
export const dynamic = 'force-dynamic';

const METRICS = ['სიჩქარე', 'ტექნიკური SEO', 'უსაფრთხოება', 'კონტენტი'];
const TABS = [
  { id: 'all', label: 'ყველა ახალი' },
  { id: 'booking', label: 'კონსულტაციები' },
  { id: 'audit', label: 'აუდიტის მოთხოვნები' },
  { id: 'chat', label: 'ჩატბოტი' },
  { id: 'facebook', label: 'Facebook ფორმა' },
  { id: 'done', label: 'დასრულებული' },
] as const;

const when = (iso: string) => new Date(iso).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const isEmail = (s: string) => s.includes('@');

function Card({ l }: { l: Lead }) {
  return (
    <article className={`adm-card${l.status === 'done' ? ' is-done' : ''}`}>
      <header>
        <span className={`adm-badge ${l.type}`}>{l.type === 'booking' ? 'კონსულტაცია' : l.type === 'chat' ? 'ჩატბოტი' : l.type === 'facebook' ? 'Facebook ფორმა' : 'აუდიტი'}</span>
        {l.status === 'new' && <span className="adm-new">ახალი</span>}
        {l.lang && l.lang !== 'ka' && <span className="adm-lang">{l.lang.toUpperCase()}</span>}
        <time dateTime={l.createdAt}>{when(l.createdAt)}</time>
      </header>
      {l.type === 'booking' ? (
        <dl>
          <dt>სახელი</dt><dd>{l.name}</dd>
          <dt>კონტაქტი</dt><dd><a href={isEmail(l.contact) ? `mailto:${l.contact}` : `tel:${l.contact.replace(/[^\d+]/g, '')}`}>{l.contact}</a></dd>
          <dt>შეხვედრა</dt><dd>{l.date}, {l.time}</dd>
          {l.quote && <><dt>პაკეტი</dt><dd>{l.quote}</dd></>}
        </dl>
      ) : l.type === 'facebook' ? (
        <dl>
          <dt>სახელი</dt><dd>{l.name}</dd>
          {l.contact && <><dt>კონტაქტი</dt><dd><a href={isEmail(l.contact) ? `mailto:${l.contact}` : `tel:${l.contact.replace(/[^\d+]/g, '')}`}>{l.contact}</a></dd></>}
          {l.answers.filter(x => x.a !== l.name && x.a !== l.contact).map(x => (
            <Fragment key={x.q}><dt>{x.q.replace(/:$/, '')}</dt><dd>{x.a}</dd></Fragment>
          ))}
        </dl>
      ) : l.type === 'chat' ? (
        <>
          <dl>
            <dt>სახელი</dt><dd>{l.name}</dd>
            <dt>კონტაქტი</dt><dd><a href={isEmail(l.contact) ? `mailto:${l.contact}` : `tel:${l.contact.replace(/[^\d+]/g, '')}`}>{l.contact}</a></dd>
            {l.need && <><dt>რა სჭირდება</dt><dd>{l.need}</dd></>}
            {l.interests.length > 0 && <><dt>თემები</dt><dd>{l.interests.join(' · ')}</dd></>}
          </dl>
          {l.transcript.length > 0 && (
            <details>
              <summary>საუბარი ({l.transcript.length})</summary>
              <ul>{l.transcript.map((m, i) => <li key={i}><b>{m.role === 'user' ? 'კლიენტი' : 'ბოტი'}:</b> {m.content}</li>)}</ul>
            </details>
          )}
        </>
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
    : tab === 'booking' || tab === 'audit' || tab === 'chat' || tab === 'facebook' ? l.type === tab && l.status === 'new'
    : l.status === 'new');
  const count = (id: string) => id === 'done' ? leads.filter(l => l.status === 'done').length
    : leads.filter(l => l.status === 'new' && (id === 'all' || l.type === id)).length;

  return (
    <main className="adm">
      <AdminNav active="leads" />
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
