import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { logCrawl } from '@/lib/crawl-log';
import { crawlerName } from '@/lib/crawlers';

// Files AI and search crawlers read first; logged, then served as-is.
const CRAWL_FILES = new Set(['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt']);

// Georgian is served from the root without a prefix (/saitis-damzadeba),
// English and Russian from /en and /ru. Internally every page lives under
// app/[lang], so root paths are rewritten to /ka/...; a visible /ka/... URL
// is redirected to the prefix-free one so each page has a single address.
// Search and AI crawler visits are logged for the admin panel (runs before the CDN cache).
export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const bot = crawlerName(request.headers.get('user-agent') ?? '');
  if (bot) event.waitUntil(logCrawl(bot, pathname));
  if (CRAWL_FILES.has(pathname)) return;

  if (pathname === '/ka' || pathname.startsWith('/ka/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (pathname === '/en' || pathname.startsWith('/en/') || pathname === '/ru' || pathname.startsWith('/ru/')) return;

  const url = request.nextUrl.clone();
  url.pathname = `/ka${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, the admin panel, Next internals and any file with an extension
  // (assets, icon.svg), except the crawler files listed above.
  matcher: ['/((?!api/|webu-panel-q7x2|_next/|assets/|.*\\.[a-z0-9]+$).*)', '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt'],
};
