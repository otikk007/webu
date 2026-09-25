import { hasLocale, type Lang } from './i18n';

// Error messages returned by the public APIs, in the visitor's language.

const M = {
  invalid: { ka: 'არასწორი მოთხოვნა', en: 'Invalid request', ru: 'Некорректный запрос' },
  tooManyLeads: { ka: 'ძალიან ბევრი მოთხოვნაა, სცადეთ მოგვიანებით', en: 'Too many requests, please try again later', ru: 'Слишком много запросов, попробуйте позже' },
  email: { ka: 'ელფოსტა არასწორია', en: 'The email address is not valid', ru: 'Некорректный email' },
  url: { ka: 'საიტის მისამართი აკლია', en: 'The website address is missing', ru: 'Не указан адрес сайта' },
  name: { ka: 'ჩაწერეთ სახელი', en: 'Please enter your name', ru: 'Укажите имя' },
  contact: { ka: 'ჩაწერეთ ტელეფონი ან ელფოსტა', en: 'Please enter a phone number or email', ru: 'Укажите телефон или email' },
  when: { ka: 'აირჩიეთ დღე და დრო', en: 'Please pick a day and time', ru: 'Выберите день и время' },
  sendFailed: { ka: 'ვერ გაიგზავნა, სცადეთ თავიდან', en: 'Could not send, please try again', ru: 'Не удалось отправить, попробуйте ещё раз' },
  enterUrl: { ka: 'ჩაწერეთ საიტის მისამართი', en: 'Enter a website address', ru: 'Введите адрес сайта' },
  tooManyChecks: { ka: 'ძალიან ბევრი შემოწმებაა, სცადეთ რამდენიმე წუთში', en: 'Too many checks, please try again in a few minutes', ru: 'Слишком много проверок, попробуйте через несколько минут' },
  badUrl: { ka: 'მისამართი არასწორია', en: 'The address is not valid', ru: 'Некорректный адрес' },
  notFound: { ka: 'საიტი ვერ მოიძებნა', en: 'Website not found', ru: 'Сайт не найден' },
  noResponse: { ka: 'საიტი არ პასუხობს', en: 'The website is not responding', ru: 'Сайт не отвечает' },
  httpError: { ka: 'საიტმა დააბრუნა შეცდომა {n}', en: 'The website returned error {n}', ru: 'Сайт вернул ошибку {n}' },
  redirects: { ka: 'ძალიან ბევრი გადამისამართება', en: 'Too many redirects', ru: 'Слишком много перенаправлений' },
  checkFailed: { ka: 'შემოწმება ვერ მოხერხდა, სცადეთ თავიდან', en: 'The check failed, please try again', ru: 'Проверка не удалась, попробуйте ещё раз' },
} satisfies Record<string, Record<Lang, string>>;

export type MessageKey = keyof typeof M;

export const langOf = (v: unknown): Lang => (typeof v === 'string' && hasLocale(v) ? v : 'ka');

export const msg = (key: MessageKey, lang: Lang, n?: number | string) => M[key][lang].replace('{n}', String(n ?? ''));
