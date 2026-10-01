import Link from 'next/link';
import { ADMIN_PATH, isAdmin } from '@/lib/admin-auth';
import { PAGE_SIZE, STATUSES, listCalls, todayStats, unlistenedCount, unreturnedIds, type CallFilter } from '@/lib/pbx';
import AdminNav from '../AdminNav';
import LoginForm from '../LoginForm';
import Voicemail from './Voicemail';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, string> = {
  answered: 'ნაპასუხები', missed: 'გამოტოვებული', voicemail: 'ხმოვანი შეტყობინება',
  busy: 'დაკავებული', abandoned_ivr: 'მენიუში გათიშა', failed: 'წარუმატებელი',
};
const LANG: Record<string, string> = { ka: 'ქართ.', en: 'ინგლ.' };
const IVR: Record<string, string> = { timeout: 'არ აირჩია' };

const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const mmss = (s: number | null) => s == null ? '—' : `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="an-tile">
      <div className="an-tile-label">{label}</div>
      <div className="an-tile-value">{value}</div>
    </div>
  );
}

type Search = CallFilter & { page?: string };

export default async function CallsPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!(await isAdmin())) {
    return <main className="adm"><LoginForm /></main>;
  }

  const sp = await searchParams;
  const f: CallFilter = { from: sp.from, to: sp.to, status: sp.status, lang: sp.lang, q: sp.q, vm: sp.vm === '1' ? '1' : undefined };
  const requested = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const [{ total, calls }, today, unlistened] = await Promise.all([listCalls(f, requested), todayStats(), unlistenedCount()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const unreturned = await unreturnedIds(calls);
  const href = (page: number) => {
    const q = new URLSearchParams(Object.entries({ ...f, page: String(page) }).filter(([, v]) => v) as [string, string][]);
    return `${ADMIN_PATH}/calls?${q}`;
  };

  return (
    <main className="adm an">
      <AdminNav active="calls" />

      <div className="an-tiles">
        <Tile label="დღეს სულ ზარები" value={today.total} />
        <Tile label="ნაპასუხები" value={today.answered} />
        <Tile label="გამოტოვებული" value={today.missed} />
        <Tile label="ხმოვანი შეტყობინებები" value={today.voicemail} />
        <Tile label="მოუსმენელი შეტყობინებები" value={unlistened} />
      </div>

      <form className="cl-filter" method="get" action={`${ADMIN_PATH}/calls`}>
        <label>დან<input type="date" name="from" defaultValue={f.from} /></label>
        <label>მდე<input type="date" name="to" defaultValue={f.to} /></label>
        <label>სტატუსი
          <select name="status" defaultValue={f.status ?? ''}>
            <option value="">ყველა</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS[s]}</option>)}
          </select>
        </label>
        <label>ენა
          <select name="lang" defaultValue={f.lang ?? ''}>
            <option value="">ყველა</option>
            <option value="ka">ქართული</option>
            <option value="en">ინგლისური</option>
            <option value="none">არ აურჩევია</option>
          </select>
        </label>
        <label>ნომერი<input type="search" name="q" inputMode="tel" placeholder="555…" defaultValue={f.q} /></label>
        <label className="cl-check"><input type="checkbox" name="vm" value="1" defaultChecked={f.vm === '1'} />მხოლოდ ხმოვანი შეტყობინებები</label>
        <button type="submit">ძებნა</button>
        <Link href={`${ADMIN_PATH}/calls`} className="cl-reset">გასუფთავება</Link>
      </form>

      <section className="an-card">
        {calls.length ? (
          <div className="an-scroll">
            <table className="an-table cl-table">
              <thead>
                <tr><th>თარიღი / დრო</th><th>ვინ დარეკა</th><th>ენა</th><th>მენიუ</th><th>ვინ უპასუხა</th><th>სტატუსი</th><th>ლოდინი</th><th>საუბარი</th><th>შეტყობინება</th></tr>
              </thead>
              <tbody>
                {calls.map(c => (
                  <tr key={c.id}>
                    <td className="num">{when(c.started_at)}</td>
                    <td className="num">
                      {c.direction === 'outbound' ? <><span className="cl-dir">გამავალი:</span> {c.callee ?? '—'}</>
                        : unreturned.has(c.id) ? <><span className="cl-hot">{c.caller}</span><span className="cl-flag">არ გადავურეკეთ</span></>
                        : c.caller ?? '—'}
                    </td>
                    <td>{c.lang ? LANG[c.lang] ?? c.lang : '—'}</td>
                    <td>{c.ivr_choice ? IVR[c.ivr_choice] ?? c.ivr_choice : '—'}</td>
                    <td>{c.answered_by ?? '—'}</td>
                    <td>{c.status ? <span className={`cl-status ${c.status}`}>{STATUS[c.status]}</span> : '—'}</td>
                    <td className="num">{mmss(c.wait_seconds)}</td>
                    <td className="num">{mmss(c.talk_seconds)}</td>
                    <td>
                      {c.voicemail_file ? <Voicemail src={`${ADMIN_PATH}/calls/${c.id}/voicemail.mp3`} unheard={!c.voicemail_listened_at} />
                        : c.status === 'voicemail' ? <span className="vm-wait">აუდიო იტვირთება…</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="an-empty">{total ? 'ამ გვერდზე ზარები არ არის.' : 'ზარები ჯერ არ არის.'}</p>
        )}
      </section>

      {pages > 1 && (
        <nav className="cl-pages" aria-label="გვერდები">
          {requested > 1 ? <Link href={href(requested - 1)}>წინა</Link> : <span />}
          <span>{requested} / {pages} · სულ {total}</span>
          {requested < pages ? <Link href={href(requested + 1)}>შემდეგი</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
