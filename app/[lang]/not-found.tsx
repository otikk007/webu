import type { Metadata } from 'next';
import ErrorScreen from '@/components/ErrorScreen';

// Rendered with HTTP 404. not-found has no route params, so ErrorScreen reads the language from the URL.
export const metadata: Metadata = { title: '404 | Webu', robots: { index: false } };

export default function NotFound() {
  return <ErrorScreen code="404" />;
}
