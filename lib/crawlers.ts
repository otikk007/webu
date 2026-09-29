// Search and AI crawlers we want to see in the admin panel, matched by user agent.
// Order matters: more specific names come before generic ones.
const CRAWLERS: [RegExp, string][] = [
  [/OAI-SearchBot/i, 'OAI-SearchBot (ChatGPT ძიება)'],
  [/ChatGPT-User/i, 'ChatGPT-User'],
  [/GPTBot/i, 'GPTBot (OpenAI)'],
  [/Claude-SearchBot/i, 'Claude-SearchBot'],
  [/Claude-User/i, 'Claude-User'],
  [/ClaudeBot/i, 'ClaudeBot (Anthropic)'],
  [/Perplexity-User/i, 'Perplexity-User'],
  [/PerplexityBot/i, 'PerplexityBot'],
  [/Google-Extended|Google-CloudVertexBot/i, 'Google AI'],
  [/Googlebot/i, 'Googlebot'],
  [/bingbot/i, 'Bingbot'],
  [/Applebot/i, 'Applebot'],
  [/meta-externalagent|meta-externalfetcher/i, 'Meta AI'],
  [/Amazonbot/i, 'Amazonbot'],
  [/CCBot/i, 'CCBot (Common Crawl)'],
  [/Bytespider/i, 'Bytespider'],
  [/YandexBot/i, 'YandexBot'],
  [/DuckDuckBot|DuckAssistBot/i, 'DuckDuckGo'],
];

export function crawlerName(ua: string): string | null {
  for (const [re, name] of CRAWLERS) if (re.test(ua)) return name;
  return null;
}
