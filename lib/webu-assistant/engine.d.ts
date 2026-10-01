// Types for engine.js (kept verbatim from WEBU_CHATBOT.md section 6).

export type FaqItem = {
  id: string;
  title: string;
  url: string;
  topic?: string;
  aspect?: string;
  extra_slots?: [string, string][];
  questions: string[];
  answer: string[];
  followups?: string[];
};

export type AssistantReply = {
  answer: string;
  sources: { title: string; url: string }[];
  mode: 'faq' | 'clarify' | 'fallback';
  intent: string;
  suggestions: string[];
  alternatives: string[];
  offer_lead?: boolean;
};

export declare class WebuFAQ {
  constructor(items: FaqItem[]);
  intents: Map<string, FaqItem & { answer_text: string }>;
  respond(text: string, previous?: string | null, seen?: string[]): AssistantReply;
}

export declare function transliterate(word: string): string;
export declare function normalize(text: string): string;
