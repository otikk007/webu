// Client-side analytics helper. Cookieless: the session id lives in sessionStorage
// and disappears when the tab closes.

let sid = '';
function session() {
  if (sid) return sid;
  try {
    sid = sessionStorage.getItem('wb_s') ?? '';
    if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('wb_s', sid); }
  } catch {
    sid = Math.random().toString(36).slice(2, 12);
  }
  return sid;
}

export type TrackType = 'pageview' | 'section' | 'click' | 'audit_run' | 'audit_request' | 'booking' | 'price' | 'leave';

export function track(type: TrackType, label?: string, extra?: Record<string, string | number | undefined>) {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({ type, l: label, s: session(), p: location.pathname, ...extra });
  try {
    fetch('/api/t', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(() => {});
  } catch { /* analytics must never break the page */ }
}
