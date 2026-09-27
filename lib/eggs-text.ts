import type { Lang } from './i18n';

// Easter egg copy. Georgian is taken verbatim from new/README.md; English and
// Russian follow it. Placeholders to replace before launch:
// WEBU10 / 10%, the coffee count and version string.

export const EGG_IDS = ['console', 'logo', 'idle', 'overscroll', 'client', 'konami', 'url', 'press'] as const;
export type EggId = (typeof EGG_IDS)[number];

export const JOBS_EMAIL = 'hello@webu.ge';
export const PROMO = { code: 'WEBU10', vault: '2026' };

const T = {
  ka: {
    names: { console: 'კონსოლი', logo: 'ლოგო ×7', idle: 'მოწყენილი კურსორი', overscroll: 'ბოლოს მიღმა', client: 'დამალული კლიენტი', konami: 'Konami Code', url: 'საიდუმლო URL', press: 'Long press' },
    found: 'საიდუმლო ნაპოვნია: {name}',
    progress: '{n} / 8, განაგრძე ძებნა',
    all: 'ყველა 8 იპოვე. შენ ნამდვილი დეტექტივი ხარ.',
    console: ['გამარჯობა, დეველოპერო!', 'შენ უკვე იცი, რომ კარგი საიტები კონსოლშიც იწყება.', 'გინდა ჩვენთან მუშაობა? დაწერე: ', 'შესანიშნავი არჩევანია. გამოგვიგზავნე CV და GitHub: {email}', 'ველოდებით!'],
    logo: ['კარგი თვალი გაქვს', 'ლოგო კოდად გადაიქცა. 4 წამში დაბრუნდება'],
    press: ['webu v2026.9 · დამზადებულია საქართველოში', 'ამ საიტზე 1 247 ფინჯანი ყავა დაიხარჯა'],
    pull: ['ეი, აქ ბოლოა!', 'კიდევ ცოტა?', 'უფრო ქვემოთ აღარაფერია...', 'მაგრამ ჩვენი იდეები ჯერ კიდევ ბევრია.'],
    client: { title: 'git log --client', rows: ['„ცოტა უფრო ლამაზი“', '„ლოგო უფრო დიდი“', '„აი, ეს!“'], stamp: 'დამტკიცდა', foot: '3 ვერსია. 1 ბედნიერი კლიენტი.' },
    konami: ['RETRO MODE ჩაირთო', 'ეს 1986 წლის კლასიკაა. გამოსასვლელად დააჭირე EXIT'],
    hireToast: ['hire() გაშვებულია', 'მოგვწერე: {email}'],
    matrix: { wake: 'გაიღვიძე, დეველოპერო...', pick: 'აირჩიე აბი.', back: 'დავბრუნდე საიტზე', deep: 'ვნახო, რამდენად ღრმაა' },
    admin: {
      note: 'მხოლოდ ავტორიზებული პერსონალისთვის. ალბათ.', user: 'მომხმარებელი', pass: 'პაროლი',
      passNotes: ['', 'ჰმ, საინტერესო პაროლია...', 'ნამდვილად ფიქრობ, რომ ეს იმუშავებს?', 'ჩვენ ყველაფერს ვხედავთ.'],
      btn: ['შესვლა', 'ჯერ დაფიქრდი', 'ნამდვილად?', 'კარგი, შენი ნებაა', 'შესვლა'], flee: 'გავიქცე, სანამ გვიან არ არის',
      hack: ['ვამოწმებთ პაროლს... არასწორია', 'ვცდილობთ მეორედ... ისევ არასწორია', 'ვრთავთ firewall.exe ...  [██████████] 100%', 'ვამზადებთ ყავას დაცვისთვის... მზადაა', 'ვიძახებთ უფროს დეველოპერს...', 'INTRUDER ALERT'],
      caught: 'კარგი ცდა იყო.', caughtText: 'ჩვენ ვხედავთ, რომ შენ გვხედავ. ჩვენს საიტებს ისე ვაწყობთ, რომ ასეთი ცდები არ გაჭრას. თუ უსაფრთხოება ასე გაინტერესებს, ჯობია ერთად ვიმუშაოთ.', leave: 'კარგი, წავედი',
    },
    vault: { locked: 'სეიფი ჩაკეტილია.', type: 'აკრიფე 4 ციფრი.', open: 'საიდუმლო კლუბში ხარ.', openSub: 'ეს კოდი მხოლოდ მათთვისაა, ვინც ეძებს.', promo: 'პრომო კოდი', offer: '10% ფასდაკლება პირველ პროექტზე', copy: 'კოდის კოპირება', copied: 'დაკოპირდა', hint: 'მინიშნება: წელი, როცა ეს საიდუმლო დაიმალა.', close: 'დახურვა' },
  },
  en: {
    names: { console: 'Console', logo: 'Logo ×7', idle: 'Bored cursor', overscroll: 'Beyond the end', client: 'Hidden client', konami: 'Konami Code', url: 'Secret URL', press: 'Long press' },
    found: 'Secret found: {name}',
    progress: '{n} / 8, keep looking',
    all: 'You found all 8. A true detective.',
    console: ['Hello, developer!', 'You already know good websites start in the console.', 'Want to work with us? Type: ', 'Great choice. Send us your CV and GitHub: {email}', 'We are waiting!'],
    logo: ['Sharp eye', 'The logo turned into code. Back in 4 seconds'],
    press: ['webu v2026.9 · made in Georgia', '1,247 cups of coffee went into this site'],
    pull: ['Hey, this is the end!', 'A little more?', 'There is nothing further down...', 'but we still have plenty of ideas.'],
    client: { title: 'git log --client', rows: ['“Make it pop a bit more”', '“Bigger logo, please”', '“Yes, that one!”'], stamp: 'Approved', foot: '3 versions. 1 happy client.' },
    konami: ['RETRO MODE on', 'A classic from 1986. Press EXIT to leave'],
    hireToast: ['hire() is running', 'Write to us: {email}'],
    matrix: { wake: 'Wake up, developer...', pick: 'Choose a pill.', back: 'Back to the site', deep: 'See how deep it goes' },
    admin: {
      note: 'Authorized personnel only. Probably.', user: 'Username', pass: 'Password',
      passNotes: ['', 'Hmm, interesting password...', 'Do you really think this will work?', 'We see everything.'],
      btn: ['Sign in', 'Think twice', 'Really?', 'Fine, your call', 'Sign in'], flee: 'Run while you still can',
      hack: ['checking password... wrong', 'trying again... still wrong', 'starting firewall.exe ...  [██████████] 100%', 'brewing coffee for security... ready', 'calling the lead developer...', 'INTRUDER ALERT'],
      caught: 'Nice try.', caughtText: 'We see you seeing us. We build our sites so attempts like this go nowhere. If security interests you that much, we should work together.', leave: 'Okay, I am leaving',
    },
    vault: { locked: 'The vault is locked.', type: 'Enter 4 digits.', open: 'You are in the secret club.', openSub: 'This code is only for those who look.', promo: 'Promo code', offer: '10% off your first project', copy: 'Copy code', copied: 'Copied', hint: 'Hint: the year this secret was hidden.', close: 'Close' },
  },
  ru: {
    names: { console: 'Консоль', logo: 'Логотип ×7', idle: 'Скучающий курсор', overscroll: 'За краем', client: 'Тайный клиент', konami: 'Konami Code', url: 'Секретный URL', press: 'Долгое нажатие' },
    found: 'Секрет найден: {name}',
    progress: '{n} / 8, ищи дальше',
    all: 'Все 8 найдены. Настоящий детектив.',
    console: ['Привет, разработчик!', 'Ты уже знаешь, что хорошие сайты начинаются в консоли.', 'Хочешь работать с нами? Напиши: ', 'Отличный выбор. Пришли нам CV и GitHub: {email}', 'Ждём!'],
    logo: ['Зоркий глаз', 'Логотип превратился в код. Вернётся через 4 секунды'],
    press: ['webu v2026.9 · сделано в Грузии', 'На этот сайт ушло 1 247 чашек кофе'],
    pull: ['Эй, здесь конец!', 'Ещё чуть-чуть?', 'Ниже уже ничего нет...', 'но идей у нас ещё много.'],
    client: { title: 'git log --client', rows: ['«Сделайте покрасивее»', '«Логотип побольше»', '«Вот, то что надо!»'], stamp: 'Утверждено', foot: '3 версии. 1 довольный клиент.' },
    konami: ['RETRO MODE включён', 'Классика 1986 года. Чтобы выйти, нажми EXIT'],
    hireToast: ['hire() запущен', 'Пиши нам: {email}'],
    matrix: { wake: 'Проснись, разработчик...', pick: 'Выбери таблетку.', back: 'Вернуться на сайт', deep: 'Узнать, насколько глубоко' },
    admin: {
      note: 'Только для авторизованного персонала. Наверное.', user: 'Пользователь', pass: 'Пароль',
      passNotes: ['', 'Хм, интересный пароль...', 'Ты правда думаешь, что это сработает?', 'Мы всё видим.'],
      btn: ['Войти', 'Подумай ещё', 'Точно?', 'Ладно, как хочешь', 'Войти'], flee: 'Сбежать, пока не поздно',
      hack: ['проверяем пароль... неверно', 'пробуем ещё раз... снова неверно', 'запускаем firewall.exe ...  [██████████] 100%', 'варим кофе для охраны... готово', 'вызываем старшего разработчика...', 'INTRUDER ALERT'],
      caught: 'Хорошая попытка.', caughtText: 'Мы видим, что ты видишь нас. Мы делаем сайты так, чтобы такие попытки не срабатывали. Если тебя так интересует безопасность, лучше поработаем вместе.', leave: 'Ладно, ухожу',
    },
    vault: { locked: 'Сейф закрыт.', type: 'Введи 4 цифры.', open: 'Ты в секретном клубе.', openSub: 'Этот код только для тех, кто ищет.', promo: 'Промокод', offer: 'Скидка 10% на первый проект', copy: 'Скопировать код', copied: 'Скопировано', hint: 'Подсказка: год, когда спрятали этот секрет.', close: 'Закрыть' },
  },
};

export type EggText = (typeof T)['ka'];
export const eggText = (lang: Lang): EggText => T[lang] as EggText;
export const IDLE_CODE = 'while (bored) {\n  yawn();\n  code();\n}';

/** Report a found egg / show a toast from anywhere; EggsProvider listens. */
export const egg = (id: EggId) => { if (typeof window !== 'undefined') dispatchEvent(new CustomEvent('webu:egg', { detail: id })); };
export const eggToast = (t: string, s: string) => { if (typeof window !== 'undefined') dispatchEvent(new CustomEvent('webu:toast', { detail: { t, s } })); };
