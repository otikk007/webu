import { notFound } from 'next/navigation';

// Any deeper unknown path (e.g. /a/b/c) renders the custom 404 inside the site layout.
export default function Missing() {
  notFound();
}
