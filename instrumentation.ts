// Runs once when the server starts (not during next build).
export async function register() {
  // After a deploy, notify IndexNow engines (Bing, Yandex) once the new server is up.
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
    const { indexNowAfterDeploy } = await import('./lib/indexnow');
    setTimeout(indexNowAfterDeploy, 30_000);
  }
}
