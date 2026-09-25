'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="adm-login">
      <h1>Webu ადმინი</h1>
      <input type="password" name="password" placeholder="პაროლი" aria-label="პაროლი" autoComplete="current-password" required autoFocus />
      {error && <p role="alert" className="adm-err">{error}</p>}
      <button type="submit" disabled={pending}>{pending ? 'მოწმდება...' : 'შესვლა'}</button>
    </form>
  );
}
