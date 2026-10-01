/**
 * Webu FAQ engine: rule-based Q&A, no AI model. Answers only from the reviewed FAQ entries.
 * Exact port of app/faq.py (Python reference implementation). No dependencies; works in Node and the browser.
 *
 *   import { WebuFAQ } from './webu-faq-engine.js';
 *   const faq = new WebuFAQ(faqItems);            // faqItems = the JSON array from webu-faq-data.json
 *   const reply = faq.respond(text, previousIntent, answeredIntents);
 *   // reply = { answer, sources[], mode: 'faq'|'clarify'|'fallback', intent, suggestions[], alternatives[], offer_lead }
 */

const ANSWER_AT = 0.36;       // minimum similarity to answer directly
const EXACT_AT = 0.97;        // similarity that means the question is already in the FAQ
const STRONG_AT = 0.75;       // a specific answer this similar is not overridden by topic+aspect detection
const SUGGEST_AT = 0.2;       // minimum similarity to offer an intent as a suggestion
const SLOT_BONUS = 0.3;       // topic + aspect named explicitly ("ლენდინგი რა ღირს")
const FOLLOWUP_BONUS = 0.5;   // elliptical follow-up resolved from the previous answer ("მაღაზია?")
const ASPECT_PENALTY = 0.15;  // price/time answer when the question mentions neither
const CLARIFY_BELOW = 0.5;    // below this, a near-tie between two answers triggers a clarifying question
const CLARIFY_GAP = 0.04;     // "near-tie": runner-up within this distance of the best answer
const ALTERNATIVE_AT = 0.32;  // minimum score for an alternative offered under an answer
const ANSWER_TEXT_WEIGHT = 0.55; // score of an answer whose text contains all of the question's rare words
const WORD_WEIGHT = 2;        // whole-word (stem) features vs. character trigrams
const TOPIC_BONUS = 0.15;     // answer about the service the question names (same penalty for other services)

const LEAD_INTENTS = new Set(['start_project', 'consultation', 'human', 'urgent', 'cheaper', 'haggle', 'no_money', 'prepare',
  'website_service', 'shop_service', 'webapp_service', 'mobile_service', 'design_service', 'ai_service',
  'ads_service', 'seo_existing', 'care_packages', 'existing_site', 'site_problem', 'portfolio_restaurant',
  'competitor_cheaper', 'trust', 'landing_vs_corporate', 'need_app', 'this_bot', 'care_other_site',
  'help_choose', 'why_website', 'custom_feature', 'individual_site', 'no_logo', 'pages_count', 'site_results']);
const MENU = ['services', 'price_overview', 'timing_overview', 'portfolio', 'contact'];
const CONTACT = 'ან დაუკავშირდით გუნდს: hello@webu.ge · +995 32 219 22 70.';

// Georgian typed on a Latin keyboard ("ra girs saiti").
const MULTI = [["ch'", 'ჭ'], ["ts'", 'წ'], ["t'", 'ტ'], ["k'", 'კ'], ["p'", 'პ'], ["q'", 'ყ'],
  ['sh', 'შ'], ['ch', 'ჩ'], ['zh', 'ჟ'], ['gh', 'ღ'], ['kh', 'ხ'], ['ts', 'ც'], ['dz', 'ძ']];
const SINGLE = Object.fromEntries([...'abgdevztiklmnoprsufqyc wjhx'].map((c, i) => [c, [...'აბგდევზთიკლმნოპრსუფქყც წჯჰხ'][i]]));
const CAPS = { T: 'ტ', W: 'ჭ', S: 'შ', C: 'ჩ', Z: 'ძ', R: 'ღ', J: 'ჟ' };

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const EMOTICON = /^(?:[:;=xX8]-?[)(DdPpOo3*]+|[)(]{2,}|<3)$/;
const NEGATION = /(^|\s)(არ|ვერ|ნუ|არა)(\s|$)/u;
const POSITIVE = ['compliment', 'ack', 'thanks', 'ack_emoji'];
const CONJUNCTIONS = new Set(['და', 'ხოლო', 'ან', 'მერე', 'კიდევ', 'ჰო', 'აბა', 'თან', 'ასევე']);
// Function words that say nothing about the topic; they must not make an off-topic question look relevant.
const STOPWORDS = new Set(`რა რას რის რამ როგორ როგორია როგორი ვინ ვის რომელი რომელ რამდენი რამდენია რამდენ სად როდის რატომ
არის იქნება იყო თუ და ან რომ ხომ კი არ ვერ ნუ არა დიახ ეს ის ეგ ამ იმ მე მეც ჩემი ჩემს ჩემთვის შენ შენი შენს
თქვენ თქვენი თქვენს ჩვენ ჩვენი უნდა შეიძლება შემიძლია შეგიძლიათ შეგიძლია მინდა მინდოდა მჭირდება მაქვს გაქვთ
აქვს გვაქვს მითხარი მითხარით მომიყევი მომიყევით მეტყვით მკითხე გთხოვთ ძალიან ცოტა უკვე კიდევ ასევე მხოლოდ
ra rogor vin ramdeni sad rodis minda maqvs gaqvt`.split(/\s+/));
const GREETING = /^(გამარჯობა|გამარჯობათ|სალამი|ჰეი|hello|hi|hey|gamarjoba|salami)[\s,!.]+/i;

const TOPIC_NAMES = { landing: 'ლენდინგი', business: 'ბიზნეს საიტი', corporate: 'კორპორატიული საიტი', shop: 'ონლაინ მაღაზია',
  webapp: 'ვებაპლიკაცია', mobile: 'მობილური აპლიკაცია', seo: 'SEO', care: 'Webu Care', hosting: 'ჰოსტინგი',
  domain: 'დომენი', logo: 'ლოგო', branding: 'ბრენდინგი', design: 'დიზაინი', ai: 'AI და ჩატბოტები',
  ads: 'რეკლამა', website: 'საიტის დამზადება' };
const TOPICS = [ // order matters: specific before generic
  ['landing', ['ლენდინგ', 'ლენდ', 'landing', 'ერთგვერდიან', 'ერთ გვერდიან', 'მარტივი გვერდ', 'მარტივი საიტ', 'ერთი გვერდ']],
  ['business', ['ბიზნეს საიტ', 'ბიზნეს-საიტ', 'სტანდარტულ საიტ', 'სტანდარტული']],
  ['corporate', ['კორპორატიულ', 'corporate']],
  ['shop', ['მაღაზი', 'ecommerce', 'e-commerce', 'shop', 'ელ-კომერც', 'ელკომერც']],
  ['webapp', ['ვებაპ', 'ვებ აპ', 'ვებ-აპ', 'crm', 'პორტალ', 'ჯავშნის სისტემ', 'web app', 'ჯავშნებ', 'ჯავშნის', 'ჩაეწერებ', 'ჩაეწერონ', 'ონლაინ ჩაწერ', 'ონლაინ ჯავშ']],
  ['mobile', ['მობილური აპ', 'მობილურ აპ', 'აპლიკაცი', 'აპი ', 'ios', 'android', 'ანდროიდ', 'აიფონ', 'app store', 'google play']],
  ['seo', ['seo', 'სეო', 'aeo', 'geo', 'ოპტიმიზაცი']],
  ['care', ['webu care', 'care', 'ქეარ', 'პაკეტ', 'მოვლ', 'მხარდაჭერ', 'საპორტ', 'support']],
  ['hosting', ['ჰოსტინგ', 'hosting', 'ჰოსტ']],
  ['domain', ['დომენ', 'domain']],
  ['logo', ['ლოგო', 'logo']],
  ['branding', ['ბრენდინგ', 'ბრენდბუქ', 'branding']],
  ['design', ['დიზაინ', 'design']],
  ['ai', ['ჩატბოტ', 'chatbot', 'ჩატ ბოტ', 'ბოტი ', 'ბოტმა', 'ბოტს', 'ავტომატიზაცი', 'ხელოვნური ინტელექტ']],
  ['ads', ['რეკლამ', 'google ads', 'meta ads', 'ტარგეტ']],
  ['website', ['საიტ', 'ვებსაიტ', 'ვებ საიტ', 'ვებგვერდ', 'ვებ გვერდ', 'website', 'site']],
];
const ASPECTS = [
  ['price', ['ღირ', 'გირს', 'ითხოვ', 'ფას', 'ჯდება', 'დაჯდ', 'დამიჯდ', 'თანხ', 'price', 'cost', 'ღირებულ']],
  ['includes', ['რა შედის', 'რას მოიცავ', 'რა მოყვება', 'რას გულისხმობს']],
  ['time', ['ვადა', 'ვადებ', 'ვადაში', 'ხანში', 'რამდენ ხან', 'რა დრო', 'რამდენ დღე', 'რამდენი დღე', 'რამდენ კვირ',
    'რამდენი კვირ', 'რამდენ თვე', 'რამდენი თვე', 'როდის იქნება მზად', 'როდის მზადდ', 'მზადდება', 'დრო სჭირდ']],
];
const SYNONYMS = { google: 'გუგლ', facebook: 'ფეისბუქ', instagram: 'ინსტაგრამ', chatgpt: 'ჩატჯიპიტი',
  email: 'ელფოსტა', mail: 'მეილი', 'ელ-ფოსტა': 'ელფოსტა', 'ელ.ფოსტა': 'ელფოსტა' };
// Word families that mean the same thing for matching; each adds a shared concept feature.
const CONCEPTS = [
  [['დამზადებ', 'დამზადდ', 'გაკეთებ', 'გამიკეთ', 'გააკეთ', 'გავაკეთ', 'შექმნ', 'შემიქმნ', 'აწყობ', 'ააწყ'], 'make'],
  [['საიტ', 'ვებსაიტ', 'ვებგვერდ', 'გვერდ', 'website'], 'site'],
  [['აპლიკაც', 'აპი', 'აპის', 'აპს', 'app'], 'app'],
  [['ღირ', 'გირს', 'ფასი', 'ფასებ', 'ფასს', 'ფასად', 'ჯდება', 'დაჯდ', 'დამიჯდ', 'ითხოვ', 'ღირებულ', 'თანხ', 'ლარ'], 'price'],
  [['ვადა', 'ვადებ', 'ვადაში', 'ხანში', 'კვირაში', 'დღეში', 'მზადდ', 'დაასრულ', 'მოასწრ'], 'time'],
  [['ადმინ', 'მართვის პანელ'], 'admin'],
  [['რუსულ', 'ინგლისურ', 'ენაზე', 'ენებზე', 'ენოვან', 'თარგმ'], 'language'],
  [['გუგლ', 'ძიებ', 'ძებნ', 'გვპოულობ', 'პოულობ', 'პოზიცი'], 'search'],
  [['ჩატბოტ', 'ბოტ'], 'bot'],
  [['დომენ'], 'domain'],
  [['ძვირ', 'იაფ', 'ორჯერ მეტ', 'მეტს ვიხდი'], 'expensive'],
  [['სხვაგან', 'სხვებთან', 'სხვებზე', 'სხვები', 'კონკურენტ', 'ფრილანსერ'], 'elsewhere'],
  [['ავანს', 'წინასწარ'], 'advance'],
  [['გადაყრ', 'ყრაა', 'ფუჭად', 'ტყუილად', 'თაღლით', 'შეიცვალა', 'მოვიდა', 'მომცა'], 'waste'],
  [['ტელეგრამ', 'telegram', 'მესენჯერ', 'messenger', 'ვაიბერ', 'viber', 'whatsapp', 'ვოთსაპ', 'ინსტაგრამ', 'ფეისბუქ'], 'channel'],
  [['მეილ', 'ელფოსტ', 'info', 'ფოსტ'], 'email'],
  [['ჯავშ', 'დაჯავშ', 'ჩაეწერ', 'ჩაწერ', 'ჩავეწერ'], 'booking'],
  [['შევხვდ', 'შეხვედრ', 'შეხვდ'], 'meet'],
  [['დამირეკ', 'დარეკ', 'ზარი', 'ზარს', 'გადმომირეკ', 'დამირეკოთ'], 'call'],
  [['ფასდაკლ', 'დამიკლ', 'დააკლ', 'აქცი', 'შეღავათ'], 'discount'],
  [['გაითიშ', 'გაფუჭ', 'გატყდ', 'გატეხ', 'შეცდომ', 'ნელა', 'ნელი', 'არ მუშაობ', 'არ იხსნ', 'დაეცა', 'პრობლემ'], 'problem'],
  [['გადახდ', 'გადავიხად', 'ტერმინალ', 'ბარათ', 'გადარიცხ', 'ანაზღაურ'], 'pay'],
  [['განვადებ', 'განაწილ', 'გადანაწილ', 'თვიან', 'ყოველთვიურ', 'უპროცენტ'], 'installment'],
  [['მხარდაჭერ', 'მოვლ', 'საპორტ', 'მომსახურ', 'მოემსახურ'], 'support'],
  [['კონტაქტ', 'დაგიკავშირ', 'დაგვიკავშირ', 'დამიკავშირ', 'მოგწერ', 'დაგირეკ', 'ნომერ', 'ტელეფონ'], 'contact'],
  [['ფოტო', 'სურათ', 'ტექსტ', 'კონტენტ'], 'content'],
  [['პროდუქტ', 'პროდუქცი', 'საქონ', 'ნივთ'], 'product'],
  [['ფლობ', 'საკუთრ', 'ეკუთვნ', 'ჩემზე', 'ჩემს სახელზე'], 'own'],
  [['ნამუშევ', 'პორტფოლ', 'პროექტებ', 'გაკეთებული'], 'portfolio'],
];
// Words that contain an aspect stem but mean something else ("ფასდაკლება" is a discount, not a price question).
const ASPECT_EXCLUDE = ['ფასდაკლ'];
// "ჰოსტინგი სხვაგან 5 ლარია" compares with others; it does not ask for our price list.
const COMPARISON_WORDS = ['სხვაგან', 'სხვებთან', 'სხვებზე'];
const DISCOUNT_WORDS = ['ფასდაკლ', 'დამიკლ', 'დააკლ', 'დაიკლ', 'დაგვიკლ'];

const split = (s) => s.split(/\s+/).filter(Boolean);
const startsWithAny = (word, prefixes) => prefixes.some((p) => word.startsWith(p));
const isLatin = (w) => /^[A-Za-z']+$/.test(w);
const isAsciiLower = (w) => /^[a-z]+$/.test(w);

export function transliterate(word) {
  if (!isLatin(word)) return word;
  let out = word[0].toLowerCase() + [...word.slice(1)].map((ch) => CAPS[ch] ?? ch.toLowerCase()).join('');
  for (const [latin, geo] of MULTI) out = out.replaceAll(latin, geo);
  return [...out].map((ch) => SINGLE[ch] ?? ch).join('').replaceAll("'", '');
}

export function normalize(text) {
  text = split(text).map((w) => SYNONYMS[w.toLowerCase()] ?? w).join(' ');
  text = text.replace(/[^\p{L}\p{N}_\s'-]/gu, ' ');
  const words = split(text);
  const latin = words.filter(isLatin);
  const extra = [...latin.map(transliterate), ...latin.filter((w) => w.slice(1).includes('t')).map((w) => transliterate(w.replaceAll('t', 'T')))];
  return [...words, ...extra.filter(Boolean)].map((w) => w.toLowerCase()).join(' ').replaceAll('-', ' ');
}

const contentWords = (text) => split(normalize(text)).filter((w) => w.length > 2 && !STOPWORDS.has(w));

function features(text) {
  const vec = new Map();
  const add = (k, v) => vec.set(k, (vec.get(k) ?? 0) + v);
  for (const word of split(normalize(text))) {
    if (word.length < 2) continue;
    const weight = STOPWORDS.has(word) ? 0.3 : 1;
    add('w:' + word.slice(0, 5), WORD_WEIGHT * weight);
    add('s:' + word.slice(0, 4), WORD_WEIGHT * weight);
    for (const [prefixes, concept] of CONCEPTS) if (startsWithAny(word, prefixes)) add('c:' + concept, WORD_WEIGHT * weight);
    const padded = `<${word}>`;
    for (let i = 0; i < padded.length - 2; i++) add(padded.slice(i, i + 3), weight);
  }
  return vec;
}

/** Damerau-Levenshtein (adjacent swaps count as one edit); returns `limit` as soon as it is exceeded. */
function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) >= limit) return limit;
  let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i, ...new Array(b.length).fill(0)];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    if (Math.min(...cur) >= limit) return limit;
    prev2 = prev; prev = cur;
  }
  return prev[prev.length - 1];
}

function detect(text, table) {
  const aspects = table === ASPECTS;
  let normalized = normalize(text);
  if (aspects) normalized = normalized.replaceAll('ღირს თუ არა', ' ').replaceAll('ღირს კი', ' '); // "is it worth it"
  let words = split(normalized);
  if (aspects) {
    if (words.some((w) => startsWithAny(w, [...DISCOUNT_WORDS, ...COMPARISON_WORDS]))) return []; // a discount, not a price question
    words = words.filter((w) => !startsWithAny(w, ASPECT_EXCLUDE));
  }
  const low = ' ' + words.join(' ') + ' ';
  let found = table.filter(([, stems]) => stems.some((s) => low.includes(' ' + s))).map(([name]) => name);
  if (!aspects && found.length > 1 && found.includes('website')) found = found.filter((t) => t !== 'website');
  if (!aspects && found.includes('webapp') && found.includes('mobile') && !low.includes('მობილურ')) found = found.filter((t) => t !== 'mobile');
  return found;
}

const maxEntry = (map) => { let best = [null, 0], first = true; for (const [k, v] of map) if (first || v > best[1]) { best = [k, v]; first = false; } return best; };

export class WebuFAQ {
  constructor(items) {
    this.intents = new Map();
    for (const item of items) {
      if (this.intents.has(item.id)) throw new Error(`Duplicate FAQ id: ${item.id}`);
      this.intents.set(item.id, { ...item, answer_text: item.answer.join('\n') });
    }
    this.bySlot = new Map();
    for (const item of this.intents.values()) {
      for (const ref of item.followups ?? []) if (!this.intents.has(ref)) throw new Error(`${item.id}: unknown followup ${ref}`);
      const slots = item.aspect ? [[item.topic, item.aspect]] : [];
      for (const [topic, aspect] of [...slots, ...(item.extra_slots ?? [])]) this.bySlot.set(`${topic}|${aspect}`, item.id);
    }
    const raw = [];
    for (const item of this.intents.values()) for (const q of item.questions) raw.push([item.id, features(q)]);
    const df = new Map();
    for (const [, vec] of raw) for (const f of vec.keys()) df.set(f, (df.get(f) ?? 0) + 1);
    this.idf = new Map([...df].map(([f, c]) => [f, Math.log((1 + raw.length) / (1 + c)) + 1]));
    this.examples = raw.map(([iid, vec]) => [iid, this.weigh(vec)]);
    // Second index: words of each answer's title and text ("llms.txt", "Schema.org" lead to their answers).
    this.answerTerms = new Map();
    for (const [iid, item] of this.intents) if (iid !== 'offtopic')
      this.answerTerms.set(iid, new Set(contentWords(item.title + ' ' + item.answer_text).map((w) => w.slice(0, 5))));
    const adf = new Map();
    for (const terms of this.answerTerms.values()) for (const t of terms) adf.set(t, (adf.get(t) ?? 0) + 1);
    this.answerIdf = new Map([...adf].map(([t, c]) => [t, Math.log(this.answerTerms.size / c)]));
    this.vocab = new Set();
    for (const item of this.intents.values()) if (item.id !== 'offtopic')
      for (const q of item.questions) for (const w of contentWords(q)) this.vocab.add(w.slice(0, 4));
    for (const terms of this.answerTerms.values()) for (const t of terms) this.vocab.add(t.slice(0, 4));
    // Full words for spelling correction (off-topic words are real words too: never "correct" them).
    this.words = new Map();
    for (const item of this.intents.values())
      for (const text of [...item.questions, item.title, item.answer_text])
        for (const w of split(text.replace(/[^\p{L}\p{N}_\s-]/gu, ' ').toLowerCase().replaceAll('-', ' ')))
          if (w.length >= 4) this.words.set(w, (this.words.get(w) ?? 0) + 1);
    this.wordsByLen = new Map();
    for (const w of this.words.keys()) { if (!this.wordsByLen.has(w.length)) this.wordsByLen.set(w.length, []); this.wordsByLen.get(w.length).push(w); }
  }

  weigh(vec) {
    const weighted = [...vec].map(([f, c]) => [f, c * (this.idf.get(f) ?? 0)]);
    const norm = Math.sqrt(weighted.reduce((s, [, v]) => s + v * v, 0)) || 1;
    return new Map(weighted.filter(([, v]) => v).map(([f, v]) => [f, v / norm]));
  }

  scores(text) {
    const query = this.weigh(features(text));
    const best = new Map();
    for (const [iid, vec] of this.examples) {
      let s = 0;
      for (const [f, w] of query) s += w * (vec.get(f) ?? 0);
      if (s > (best.get(iid) ?? 0)) best.set(iid, s);
    }
    for (const [iid, s] of this.answerScores(text)) if (s > (best.get(iid) ?? 0)) best.set(iid, s);
    return best;
  }

  /** Fix typos in words the FAQ has never seen ("გნვადება" -> "განვადება", "worpress" -> "wordpress"). */
  correct(text) {
    return split(text).map((token) => {
      const core = token.replace(/[^\p{L}\p{N}_-]/gu, '').toLowerCase();
      let fixed = null;
      const forms = new Set([core]);
      if (isAsciiLower(core)) { forms.add(transliterate(core)); forms.add(transliterate(core.replaceAll('t', 'T'))); } // "jdeba" = "ჯდება"
      const known = [...forms].some((w) => this.words.has(w) || this.vocab.has(w.slice(0, 4)));
      if (core.length >= 4 && !known && !/^\d+$/.test(core) && !core.startsWith('-')) {
        const limit = core.length < 7 ? 1 : 2;
        let best = limit + 1;
        for (let n = core.length - limit; n <= core.length + limit; n++) {
          for (const cand of this.wordsByLen.get(n) ?? []) {
            const d = editDistance(core, cand, best + 1); // exact up to `best`; best + 1 means "farther"
            // equally close candidates: prefer the more common word ("სატი" -> "საიტი", not "სამი")
            if (d < best || (d === best && fixed && this.words.get(cand) > this.words.get(fixed))) { best = d; fixed = cand; }
          }
        }
      }
      return fixed ? token.toLowerCase().replaceAll(core, fixed) : token;
    }).join(' ');
  }

  /** Share of the question's rare words found in each answer text (IDF-weighted), scaled by ANSWER_TEXT_WEIGHT. */
  answerScores(text) {
    const unseen = Math.log(this.answerTerms.size);
    const groups = [];
    for (const word of split(text.replace(/[^\p{L}\p{N}_\s-]/gu, ' ').toLowerCase())) {
      if (word.length <= 2 || STOPWORDS.has(word)) continue;
      const variants = new Set([word.slice(0, 5)]);
      if (isAsciiLower(word)) { variants.add(transliterate(word).slice(0, 5)); variants.add(transliterate(word.replaceAll('t', 'T')).slice(0, 5)); }
      groups.push(variants);
    }
    const result = new Map();
    if (!groups.length) return result;
    const weights = groups.map((g) => { const known = [...g].filter((v) => this.answerIdf.has(v)).map((v) => this.answerIdf.get(v)); return known.length ? Math.max(...known) : unseen; });
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    for (const [iid, terms] of this.answerTerms) {
      let covered = 0;
      groups.forEach((g, i) => { if ([...g].some((v) => terms.has(v))) covered += weights[i]; });
      if (covered) result.set(iid, ANSWER_TEXT_WEIGHT * covered / total);
    }
    return result;
  }

  /** Most meaningful words must be known to the FAQ vocabulary (half is enough for a confident match). */
  onTopic(text, score = 0) {
    const words = contentWords(text);
    if (!words.length) return true;
    const share = words.filter((w) => this.vocab.has(w.slice(0, 4))).length / words.length;
    return share > 0.5 || (share > 0 && score >= 0.6);
  }

  unknownDetail(text) {
    const cleaned = text.trim().replace(GREETING, '') || text;
    return contentWords(cleaned).filter((w) => w.length >= 5 && !this.vocab.has(w.slice(0, 4)) && !isAsciiLower(w));
  }

  /** Show the "leave a request" form after answers where the customer leans toward buying, or when we failed. */
  offersLead(reply) {
    const intent = reply.intent ?? '';
    return reply.mode === 'fallback' || LEAD_INTENTS.has(intent) || ['price_', 'timing_', 'industry_'].some((p) => intent.startsWith(p));
  }

  label(iid) { return this.intents.get(iid).questions[0]; }

  match(text, previous = null) {
    if (!WORD_CHAR.test(text) || EMOTICON.test(text.trim())) { // only emoji/punctuation: "👍", "?", ":D"
      const iid = text.includes('?') ? 'help_menu' : 'ack_emoji';
      return { intents: [iid], score: 1, ranked: [[iid, 1]] };
    }
    const cleaned = this.correct(text.trim().replace(GREETING, '') || text.trim());
    const scores = this.scores(cleaned);
    const topics = detect(cleaned, TOPICS), aspects = detect(cleaned, ASPECTS);
    const words = (cleaned.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? []).filter((w) => !CONJUNCTIONS.has(w));
    // A follow-up fragment ("მაღაზია?", "და ლოგო?"), not a full question like "CRM რას ნიშნავს?"
    const elliptical = CONJUNCTIONS.has(split(cleaned.toLowerCase())[0]) || words.length <= 2 || (words.length <= 3 && !topics.length);
    const prev = previous ? this.intents.get(previous) ?? null : null;
    const exact = maxEntry(scores);
    if (exact[1] >= EXACT_AT && !(prev && elliptical)) { // the question is (almost) literally in the FAQ
      if (exact[0] === 'offtopic') return { intents: [], score: 0, ranked: [exact] };
      return { intents: [exact[0]], score: exact[1], ranked: [exact] };
    }
    if (NEGATION.test(cleaned)) for (const iid of POSITIVE) if (scores.has(iid)) scores.set(iid, scores.get(iid) - 0.5); // "არ მომწონს" is no compliment
    const named = topics.filter((t) => t !== 'website');
    for (const [iid, value] of scores) {
      const item = this.intents.get(iid);
      let v = value;
      if (named.length && item.topic) v += named.includes(item.topic) ? TOPIC_BONUS : -TOPIC_BONUS;
      if ((item.aspect === 'price' || item.aspect === 'time') && !aspects.includes(item.aspect)) v -= ASPECT_PENALTY;
      scores.set(iid, v);
    }
    let slots = [], bonus = SLOT_BONUS;
    if (topics.length && aspects.length) slots = topics.flatMap((t) => aspects.map((a) => [t, a]));
    else if (prev && elliptical) {
      bonus = FOLLOWUP_BONUS;
      if (topics.length && !aspects.length && prev.aspect) slots = topics.map((t) => [t, prev.aspect]);
      else if (aspects.length && !topics.length && prev.topic) slots = aspects.map((a) => [prev.topic, a]);
    }
    let chosen = [...new Set(slots.map(([t, a]) => this.bySlot.get(`${t}|${a}`)).filter(Boolean))];
    const [rawId, raw] = maxEntry(scores);
    if (bonus === SLOT_BONUS && raw >= STRONG_AT && !chosen.includes(rawId) && !this.intents.get(rawId).aspect && aspects.every((a) => a === 'includes'))
      chosen = []; // a strong specific match ("Pro პაკეტში რა შედის?") beats generic topic+aspect slots
    for (const iid of chosen) scores.set(iid, (scores.get(iid) ?? 0) + bonus);

    const ranked = [...scores].sort((a, b) => b[1] - a[1]);
    let [topId, top] = ranked[0] ?? [null, 0];
    if (topId === 'offtopic' && !chosen.length) return { intents: [], score: 0, ranked };
    if (chosen.length && !chosen.includes(topId)) {
      const bestChosen = chosen.reduce((a, b) => (scores.get(b) > scores.get(a) ? b : a));
      const topItem = this.intents.get(topId);
      const sameFamily = topItem.aspect && topics.includes(topItem.topic);
      if (sameFamily || top - scores.get(bestChosen) < 0.08) { topId = bestChosen; top = scores.get(bestChosen); }
    }
    if (chosen.includes(topId)) { // "ლენდინგი და მაღაზია რა ღირს?" -> several slot answers at once
      const explicit = topics.length > 0 && aspects.length > 0;
      return { intents: chosen.filter((iid) => explicit || scores.get(iid) >= top - 0.15).slice(0, 3), score: top, ranked };
    }
    if (top >= ANSWER_AT && this.onTopic(cleaned, top)) return { intents: [topId], score: top, ranked };
    return { intents: [], score: top, ranked };
  }

  /** previous: intent of the last answer; seen: intents already answered in this conversation. */
  respond(text, previous = null, seen = []) {
    const seenSet = new Set(seen);
    text = this.correct(text);
    const result = this.match(text, previous);
    const ids = result.intents;
    const ranked = result.ranked.filter(([i]) => i !== 'offtopic');
    let reply;
    if (!ids.length) reply = this.fallback(text, ranked);
    else {
      const top = result.score;
      const rivals = ranked.filter(([i, sc]) => !ids.includes(i) && sc >= top - CLARIFY_GAP).map(([i]) => i);
      if (ids.length === 1 && top < CLARIFY_BELOW && rivals.length) { // two answers about equally likely: ask, don't guess
        reply = { answer: 'რომელი გაინტერესებთ? აირჩიეთ ქვემოთ ან დააზუსტეთ კითხვა.', sources: [], mode: 'clarify', intent: '',
          suggestions: [ids[0], ...rivals.slice(0, 2)].map((i) => this.label(i)), alternatives: [] };
      } else {
        const items = ids.map((i) => this.intents.get(i));
        let answer = items.map((i) => i.answer_text).join('\n\n');
        const detail = this.unknownDetail(text);
        if (items.length === 1 && items[0].aspect === 'includes' && detail.length >= 2) // known service, unknown detail
          answer = `„${detail.join(' ')}“: ამ კონკრეტულ დეტალზე ჩემს ბაზაში ინფორმაცია არ არის, დააზუსტეთ გუნდთან (hello@webu.ge · +995 32 219 22 70). ზოგადად კი:\n\n` + answer;
        const sources = [], urls = new Set();
        for (const i of items) if (!urls.has(i.url)) { urls.add(i.url); sources.push({ title: i.title, url: i.url }); }
        const suggestions = [...new Set(items.flatMap((i) => i.followups ?? []).filter((f) => !ids.includes(f) && !seenSet.has(f)))].slice(0, 3);
        const alternatives = ranked.filter(([i, sc]) => !ids.includes(i) && !suggestions.includes(i) && sc >= Math.max(ALTERNATIVE_AT, top - 0.3)).slice(0, 3).map(([i]) => i);
        reply = { answer, sources, mode: 'faq', intent: ids[ids.length - 1],
          suggestions: suggestions.map((f) => this.label(f)), alternatives: alternatives.map((a) => this.label(a)) };
      }
    }
    reply.offer_lead = this.offersLead(reply);
    return reply;
  }

  fallback(text, ranked) {
    const cleaned = text.trim().replace(GREETING, '') || text.trim();
    const all = detect(cleaned, TOPICS);
    const named = all.filter((t) => t !== 'website').length ? all.filter((t) => t !== 'website') : all;
    const candidates = this.onTopic(cleaned) ? ranked.slice(0, 3).filter(([, sc]) => sc >= SUGGEST_AT).map(([i]) => i) : [];
    let answer, options;
    if (candidates.length) {
      answer = `ზუსტად ვერ მივხვდი, რას გულისხმობთ. იქნებ ერთ-ერთი ეს გაინტერესებთ? თუ არა, სხვა სიტყვებით მკითხეთ ${CONTACT}`;
      options = candidates;
    } else if (named.length) { // the service is recognised but not this detail: offer its main questions
      const order = { includes: 0, price: 1, time: 2 };
      options = [...this.intents.values()].filter((i) => named.includes(i.topic))
        .sort((a, b) => (order[a.aspect] ?? 3) - (order[b.aspect] ?? 3)).slice(0, 4).map((i) => i.id);
      const names = named.filter((t) => TOPIC_NAMES[t]).map((t) => TOPIC_NAMES[t]).join(', ');
      answer = `ამ კონკრეტულ დეტალზე ზუსტი პასუხი ჩემს ბაზაში არ მაქვს. თემაზე „${names}“ შემიძლია ამ კითხვებზე გიპასუხოთ. დეტალისთვის მკითხეთ სხვანაირად ${CONTACT}`;
    } else {
      answer = `ამ კითხვაზე პასუხი ჩემს ბაზაში არ მაქვს. შემიძლია გიპასუხოთ Webu-ს სერვისებზე, ფასებზე, ვადებზე, გადახდაზე, ჰოსტინგსა და მხარდაჭერაზე. აირჩიეთ თემა ${CONTACT}`;
      options = MENU;
    }
    return { answer, sources: [], mode: 'fallback', intent: '', suggestions: options.map((i) => this.label(i)), alternatives: [] };
  }
}
