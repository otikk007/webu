import { isAdmin } from '@/lib/admin-auth';
import { deployLog, deployStatus } from '@/lib/deploy';
import { deploy } from '../actions';
import AdminNav from '../AdminNav';
import LoginForm from '../LoginForm';

export const dynamic = 'force-dynamic';

const STATE = { running: 'მიმდინარეობს…', ok: 'წარმატებით დასრულდა', failed: 'ვერ შესრულდა' };
const when = (iso: string) => new Date(iso).toLocaleString('ka-GE', { timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default async function DeployPage() {
  if (!(await isAdmin())) {
    return <main className="adm"><LoginForm /></main>;
  }

  const s = deployStatus();
  const running = s?.state === 'running';

  return (
    <main className="adm">
      {/* Reload every few seconds while the build runs; the server restarts at the end. */}
      {running && <meta httpEquiv="refresh" content="4" />}
      <AdminNav active="deploy" />
      <section className="dp-card">
        <div>
          <h1>Build და გაშვება</h1>
          <p className="dp-note">აწყობს საიტს სერვერზე არსებული კოდიდან და გადატვირთავს. ცოცხალი საიტი build-ის დროს ძველ ვერსიაზე მუშაობს; თუ build ჩავარდა, არაფერი იცვლება. გადატვირთვას რამდენიმე წამი სჭირდება.</p>
        </div>
        <form action={deploy}>
          <button type="submit" disabled={running}>{running ? 'მიმდინარეობს…' : 'Build და გაშვება'}</button>
        </form>
      </section>
      {s && (
        <p className={`dp-state ${s.state}`}>
          {STATE[s.state]} · დაიწყო {when(s.startedAt)}{s.finishedAt && ` · დასრულდა ${when(s.finishedAt)}`}
        </p>
      )}
      {s && <pre className="dp-log">{deployLog() || '…'}</pre>}
    </main>
  );
}
