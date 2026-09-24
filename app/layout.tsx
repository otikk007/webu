import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Georgian, JetBrains_Mono, Unbounded } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const geo = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], weight: ['400', '500', '600', '700', '800', '900'], display: 'swap', variable: '--font-geo' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });
const unb = Unbounded({ subsets: ['latin'], weight: '800', display: 'swap', preload: false, variable: '--font-unb' });

const title = 'Webu | ვებსაიტები, აპლიკაციები და SEO თბილისში';
const description = 'სრული ვებ სერვისი ერთ გუნდში. ვებსაიტები, მობილური აპლიკაციები, SEO ოპტიმიზაცია, UI და UX დიზაინი, ონლაინ მაღაზიები, ბრენდინგი და ჰოსტინგი.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'ka_GE', url: '/', siteName: 'Webu', title, description, images: [{ url: '/assets/s-hero.jpg' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/assets/s-hero.jpg'] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#0E0F12', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className={`${geo.variable} ${mono.variable} ${unb.variable}`}>
      <body>{children}</body>
    </html>
  );
}
