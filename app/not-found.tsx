import type { Metadata } from 'next';
import Link from 'next/link';
import { SERVICE_PAGES } from '@/lib/pages';
import { pageHref } from '@/lib/seo';

export const metadata: Metadata = { title: 'გვერდი ვერ მოიძებნა | Webu', robots: { index: false } };

export default function NotFound() {
  return (
    <main className="nf">
      <p className="mono">404</p>
      <h1>გვერდი ვერ მოიძებნა</h1>
      <p>შესაძლოა ბმული შეიცვალა ან გვერდი წაიშალა. სცადეთ ერთ-ერთი ქვემოთ მოცემული გვერდი.</p>
      <nav aria-label="სერვისები">
        <Link href="/" className="cp-cta">მთავარი გვერდი</Link>
        {SERVICE_PAGES.map(p => <Link key={p.slug} href={pageHref(p)}>{p.nav}</Link>)}
      </nav>
    </main>
  );
}
