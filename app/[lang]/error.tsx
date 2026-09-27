'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/components/ErrorScreen';

// Runtime errors inside a page render the 500 version of the error screen.
export default function PageError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { console.error(error); }, [error]);
  return <ErrorScreen code="500" />;
}
