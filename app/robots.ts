import type { MetadataRoute } from 'next';
import { IS_STAGING, SITE_URL } from '@/lib/site';

// AI search and assistant crawlers are welcomed explicitly: being cited by
// ChatGPT, Claude, Perplexity and Gemini is part of Webu's visibility strategy.
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  // Test copy on Vercel: closed to all crawlers.
  if (IS_STAGING) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: AI_BOTS, allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
