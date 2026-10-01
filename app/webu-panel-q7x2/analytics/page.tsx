import Link from 'next/link';
import { ADMIN_PATH, isAdmin } from '@/lib/admin-auth';
import { unansweredQuestions } from '@/lib/chat-log';
import { getCrawlStats } from '@/lib/crawl-log';
import { getStats, type Row } from '@/lib/stats';
import AdminNav from '../AdminNav';
import LoginForm from '../LoginForm';

export const dynamic = 'force-dynamic';

const PERIODS = [{ d: 1, l: '24 საათი' }, { d: 7, l: '7 დღე' }, { d: 30, l: '30 დღე' }, { d: 90, l: '90 დღე' }];
const SECTIONS: Record<string, string> = {
  top: 'მთავარი ბლოკი', services: 'სერვისები', work: 'ნამუშევრები', process: 'როგორ ვმუშაობთ',
  audit: 'SEO აუდიტი', price: 'ფასი', faq: 'კითხვები', contact: 'კონსულტაცია',
};
const EVENT: Record<string, string> = {
  pageview: 'შემოვიდა', section: 'ნახა', click: 'დააჭირა', audit_run: 'შეამოწმა საიტი',
  audit_request: '⭐ მოითხოვა ანგარიში', booking: '⭐ დაჯავშნა კონსულტაცია', price: 'აირჩია ფასში', leave: 'წავიდა',
};

const tbilisi = (iso: string, withDate = true) => new Date(iso).toLocaleString('ka-GE', {
  timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', ...(withDate ? { day: 'numeric', month: 'short' } : {}),
});
const dur = (s: number | null) => s == null ? '—' : s < 60 ? `${s} წმ` : `${Math.floor(s / 60)} წთ ${s % 60} წმ`;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Tile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="an-tile">
      <div className="an-tile-label">{label}</div>
      <div className="an-tile-value">{value}</div>
      {sub && <div className="an-tile-sub">{sub}</div>}
    </div>
  );
}

/** Horizontal single-series bars; values are always printed, so nothing relies on color. */
function Bars({ title, rows, total, name = (k: string) => k, unit = '' }: { title: string; rows: Row[]; total?: number; name?: (k: string) => string; unit?: string }) {
  const max = Math.max(1, ...rows.map(r => r.n));
  return (
    <section className="an-card">
      <h2>{title}</h2>
      {rows.length ? (
        <ul className="an-bars">
          {rows.map(r => (
            <li key={r.k} title={`${name(r.k)}: ${r.n}${unit}${total ? ` (${pct(r.n, total)}%)` : ''}`}>
              <span className="an-bar" style={{ width: `${(r.n / (total ?? max)) * 100}%` }} />
              <span className="an-bar-k">{name(r.k)}</span>
              <span className="an-bar-n">{r.n}{unit}{total ? <small> {pct(r.n, total)}%</small> : null}</span>
            </li>
          ))}
        </ul>
      ) : <p className="an-empty">მონაცემები ჯერ არ არის</p>}
    </section>
  );
}

/** Visitors per day, one bar per day with a hover tooltip. */
function Daily({ rows, days }: { rows: Row[]; days: number }) {
  const n = Math.max(days, 1);
  const map = new Map(rows.map(r => [r.k, r.n]));
  const series = Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Tbilisi' });
    return { k: d, n: map.get(d) ?? 0 };
  });
  const max = Math.max(1, ...series.map(s => s.n));
  return (
    <section className="an-card an-wide">
      <h2>ვიზიტორები დღეების მიხედვით</h2>
      <div className="an-daily" role="img" aria-label={`ვიზიტორები: ${series.map(s => `${s.k} ${s.n}`).join(', ')}`}>
        {series.map(s => (
          <div key={s.k} className="an-col" tabIndex={0}>
            <span className="an-colbar" style={{ height: `${Math.max(s.n ? 4 : 0, (s.n / max) * 100)}%` }} />
            <span className="an-tip">{new Date(s.k).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' })}: {s.n}</span>
          </div>
        ))}
      </div>
      <div className="an-axis"><span>{series[0].k.slice(5)}</span><span>max {max}</span><span>{series[series.length - 1].k.slice(5)}</span></div>
    </section>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  if (!(await isAdmin())) return <main className="adm"><LoginForm /></main>;

  const d = Number((await searchParams).d);
  const days = PERIODS.some(p => p.d === d) ? d : 7;
  const [s, crawl, chat] = await Promise.all([getStats(days), getCrawlStats(days), unansweredQuestions(days)]);
  const secOrder = Object.keys(SECTIONS);
  const sections = secOrder.filter(k => k !== 'top').map(k => ({ k, n: s.sections.find(r => r.k === k)?.n ?? 0 }));

  return (
    <main className="adm an">
      <AdminNav active="analytics" />
      <nav className="adm-tabs" aria-label="პერიოდი">
        {PERIODS.map(p => (
          <Link key={p.d} href={`${ADMIN_PATH}/analytics?d=${p.d}`} aria-current={p.d === days ? 'page' : undefined}>{p.l}</Link>
        ))}
      </nav>

      <div className="an-tiles">
        <Tile label="ვიზიტორები" value={s.visitors} sub={`${s.views} ნახვა`} />
        <Tile label="საშუალო დრო საიტზე" value={dur(s.avgSec)} />
        <Tile label="მოთხოვნები" value={s.leads} sub={`კონვერსია ${pct(s.funnel[3].n, s.funnel[0].n)}%`} />
        <Tile label="აუდიტის შემოწმებები" value={s.audits} />
      </div>

      <div className="an-grid">
        <Daily rows={s.daily} days={days} />
        <Bars title="ძაბრი: სად იკარგებიან" rows={s.funnel} total={s.funnel[0].n} />
        <Bars title="საიდან მოდიან" rows={s.sources} />
        <Bars title="რომელ სექციამდე მიდიან" rows={sections} total={s.funnel[0].n} name={k => SECTIONS[k] ?? k} />
        <Bars title="სად ტოვებენ საიტს" rows={s.exits} name={k => SECTIONS[k] ?? k} />
        <Bars title="რას აჭერენ" rows={s.clicks} name={k => k.replace(/^(top|services|work|process|audit|price|faq|contact) · /, (_, id: string) => `${SECTIONS[id]} · `)} />
        <Bars title="მოწყობილობა" rows={s.devices} />
        <Bars title="ქალაქი / ქვეყანა" rows={s.places} />

        <section className="an-card">
          <h2>ჩატბოტი: უპასუხო კითხვები</h2>
          {chat.rows.length ? (
            <table className="an-table">
              <thead><tr><th>კითხვა</th><th>რამდენჯერ</th></tr></thead>
              <tbody>{chat.rows.map(r => <tr key={r.k}><td>{r.k}</td><td className="num">{r.n}</td></tr>)}</tbody>
            </table>
          ) : <p className="an-empty">ჩატბოტმა ყველა კითხვას უპასუხა</p>}
          <p className="an-note">ამ პერიოდში ჩატში {chat.total} კითხვა დაისვა. აქ ჩანს ისინი, რომლებზეც ბოტმა ვერ უპასუხა ან მომხმარებელმა უთხრა, რომ ეს არ იყო. ხშირ კითხვებს lib/webu-assistant/faq-data.json-ში შესაბამისი თემის questions-ში დაამატებ.</p>
        </section>

        <section className="an-card">
          <h2>AI და საძიებო ბოტები</h2>
          {crawl.bots.length ? (
            <table className="an-table">
              <thead><tr><th>ბოტი</th><th>ვიზიტი</th><th>ბოლოს</th></tr></thead>
              <tbody>{crawl.bots.map(b => (
                <tr key={b.bot}><td>{b.bot}</td><td className="num">{b.n}</td><td>{tbilisi(b.last)}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="an-empty">ამ პერიოდში ბოტი არ შემოსულა</p>}
          <p className="an-note">ChatGPT, Claude, Perplexity და Google ამ ბოტებით კითხულობენ საიტს. თუ ისინი რეგულარულად შემოდიან, საიტი AI პასუხებში მოხვედრის კანდიდატია.</p>
        </section>
        <Bars title="რომელ გვერდებს კითხულობენ ბოტები" rows={crawl.pages} />

        <section className="an-card">
          <h2>შემოწმებული საიტები (აუდიტი)</h2>
          {s.auditSites.length ? (
            <table className="an-table">
              <thead><tr><th>საიტი</th><th>ქულა</th><th>დრო</th></tr></thead>
              <tbody>{s.auditSites.map(a => (
                <tr key={a.site}><td><a href={`https://${a.site}`} target="_blank" rel="noopener noreferrer nofollow">{a.site}</a></td><td className="num">{a.score}</td><td>{tbilisi(a.ts)}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="an-empty">ჯერ არავის შეუმოწმებია</p>}
          <p className="an-note">ვინც საიტი შეამოწმა, მაგრამ ელფოსტა არ დატოვა, მაინც პოტენციური კლიენტია.</p>
        </section>

        <section className="an-card an-wide">
          <h2>ბოლო აქტივობა</h2>
          {s.recent.length ? (
            <div className="an-scroll">
              <table className="an-table">
                <thead><tr><th>დრო</th><th>ვიზიტორი</th><th>მოქმედება</th><th>დეტალი</th></tr></thead>
                <tbody>{s.recent.map((r, i) => (
                  <tr key={i} className={r.type === 'audit_request' || r.type === 'booking' ? 'hot' : undefined}>
                    <td>{tbilisi(r.ts)}</td>
                    <td><span className="an-sid">#{r.session.slice(0, 4)}</span> {r.device}{r.place ? ` · ${r.place}` : ''}</td>
                    <td>{EVENT[r.type] ?? r.type}</td>
                    <td>{r.type === 'section' || r.type === 'leave' ? SECTIONS[r.label ?? 'top'] ?? r.label : r.type === 'click' ? r.label?.replace(/^(top|services|work|process|audit|price|faq|contact) · /, (_, id: string) => `${SECTIONS[id]} · `) : r.label}
                      {r.type === 'pageview' && r.source ? `წყარო: ${r.source}` : ''}
                      {r.type === 'leave' && r.value != null ? ` · ${dur(r.value)}` : ''}
                      {r.type === 'audit_run' && r.value != null ? ` · ქულა ${r.value}` : ''}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="an-empty">აქტივობა ჯერ არ არის</p>}
        </section>
      </div>
      <p className="an-note">ანალიტიკა cookie-ების გარეშე მუშაობს და პერსონალურ მონაცემებს არ ინახავს. თქვენი ვიზიტები, როცა ადმინში შესული ხართ, არ ითვლება. ბოტები გაფილტრულია.</p>
    </main>
  );
}
