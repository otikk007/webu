import 'server-only';
import { spawn } from 'node:child_process';
import { openSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Admin "build and restart": runs scripts/deploy.sh in the background and reads
// the status and log it writes to data/.

export type DeployStatus = { state: 'running' | 'ok' | 'failed'; pid: number; startedAt: string; finishedAt: string; slot: string };

const dir = join(process.cwd(), 'data');
const LOG = join(dir, 'deploy.log');

const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };

export function deployStatus(): DeployStatus | null {
  try {
    const s = JSON.parse(readFileSync(join(dir, 'deploy.json'), 'utf8')) as DeployStatus;
    // A deploy that died mid-build (server restarted by hand, etc.) never wrote its result.
    return s.state === 'running' && !alive(s.pid) ? { ...s, state: 'failed' } : s;
  } catch {
    return null;
  }
}

export function deployLog(lines = 80) {
  try {
    return readFileSync(LOG, 'utf8').split('\n').slice(-lines).join('\n');
  } catch {
    return '';
  }
}

export function startDeploy() {
  if (deployStatus()?.state === 'running') return;
  const out = openSync(LOG, 'w');
  spawn('bash', [join(process.cwd(), 'scripts', 'deploy.sh'), String(process.pid)], {
    cwd: process.cwd(), detached: true, stdio: ['ignore', out, out], env: process.env,
  }).unref();
}
