import { NextResponse, type NextRequest } from 'next/server';

// Georgian is served from the root without a prefix (/saitis-damzadeba),
// English and Russian from /en and /ru. Internally every page lives under
// app/[lang], so root paths are rewritten to /ka/...; a visible /ka/... URL
// is redirected to the prefix-free one so each page has a single address.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  // (assets, icon.svg, robots.txt, sitemap.xml, llms.txt).
  matcher: ['/((?!api/|webu-panel-q7x2|_next/|assets/|.*\\.[a-z0-9]+$).*)'],
};
