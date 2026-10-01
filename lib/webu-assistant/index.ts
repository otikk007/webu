import 'server-only';
import { WebuFAQ, type FaqItem } from './engine.js';
import items from './faq-data.json';

// One engine per server process: building the index takes ~100 ms, a reply ~5 ms.
// The data (~370 KB) stays on the server and never reaches the client bundle.
let engine: WebuFAQ | null = null;

export function assistant() {
  engine ??= new WebuFAQ(items as FaqItem[]);
  return engine;
}

export const isIntent = (id: unknown): id is string => typeof id === 'string' && assistant().intents.has(id);

export type { AssistantReply } from './engine.js';
