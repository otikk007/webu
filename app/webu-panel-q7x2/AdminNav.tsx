import Link from 'next/link';
import { ADMIN_PATH } from '@/lib/admin-auth';
import { logout } from './actions';

export default function AdminNav({ active }: { active: 'leads' | 'analytics' }) {
  return (
    <div className="adm-top">
      <nav className="adm-switch" aria-label="ადმინის განყოფილებები">
        <Link href={ADMIN_PATH} aria-current={active === 'leads' ? 'page' : undefined}>მოთხოვნები</Link>
        <Link href={`${ADMIN_PATH}/analytics`} aria-current={active === 'analytics' ? 'page' : undefined}>ანალიტიკა</Link>
      </nav>
      <form action={logout}><button type="submit" className="ghost">გასვლა</button></form>
    </div>
  );
}
