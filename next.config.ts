import { readFileSync } from 'node:fs';
import type { NextConfig } from 'next';

// Build folder: NEXT_DIST_DIR while the admin deploy builds, otherwise the folder
// .next-slot points at (the last successful deploy), otherwise .next.
const slot = (() => { try { return readFileSync('.next-slot', 'utf8').trim(); } catch { return ''; } })();

const nextConfig: NextConfig = {
  // The admin deploy builds into a side folder and switches to it (scripts/deploy.sh).
  distDir: process.env.NEXT_DIST_DIR || slot || '.next',
  images: { formats: ['image/avif', 'image/webp'] },
  // Inline CSS into the HTML so it no longer blocks the first paint.
  experimental: { inlineCss: true },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Test copy on Vercel (VERCEL=1): keep every response out of search indexes.
        ...(process.env.VERCEL === '1' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ],
    }];
  },
};

export default nextConfig;
