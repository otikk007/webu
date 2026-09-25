import type { Metadata } from 'next';
import { fontClasses } from '@/lib/fonts';
import '../globals.css';
import './admin.css';

export const metadata: Metadata = { title: 'Webu ადმინი', robots: { index: false, follow: false }, icons: { icon: '/icon.svg' } };

// The admin panel is its own root layout: the public site lives under app/[lang].
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={fontClasses}>
      <body>{children}</body>
    </html>
  );
}
