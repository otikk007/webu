import Link from 'next/link';
import { ADMIN_PATH } from '@/lib/admin-auth';
import { unlistenedCount } from '@/lib/pbx';
import { logout } from './actions';

export default async function AdminNav({ active }: { active: 'leads' | 'calls' | 'analytics' | 'deploy' }) {
  const unheard = await unlistenedCount();
  return (
    <div className="adm-top">
      <nav className="adm-switch" aria-label="ადმინის განყოფილებები">
        <Link href={ADMIN_PATH} aria-current={active === 'leads' ? 'page' : undefined}>მოთხოვნები</Link>
        <Link href={`${ADMIN_PATH}/calls`} aria-current={active === 'calls' ? 'page' : undefined}>ზარები{unheard > 0 && <span className="adm-count" aria-label={`${unheard} მოუსმენელი შეტყობინება`}>{unheard}</span>}</Link>
        <Link href={`${ADMIN_PATH}/analytics`} aria-current={active === 'analytics' ? 'page' : undefined}>ანალიტიკა</Link>
        <Link href={`${ADMIN_PATH}/deploy`} aria-current={active === 'deploy' ? 'page' : undefined}>Deploy</Link>
      </nav>
      <form action={logout}><button type="submit" className="ghost">გასვლა</button></form>
    </div>
  );
}
