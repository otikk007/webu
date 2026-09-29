import type { Lang } from './i18n';

// Real client projects (jobs/webu_projects handoff). Order = display order.
// Media are the original screen-recording GIFs, served untouched from /public/projects.

type Text = { desc: string; tags: string[] };
type Crop = { aspect: string; left: string; top: string; width: string };

export type Project = {
  id: string;
  title: string;
  url: string;
  domain: string;
  label: string;
  media: string;
  bg: string;
  glow: string;
  crop?: Crop;
  text: Record<Lang, Text>;
};

export const PROJECTS: Project[] = [
  {
    id: '01', title: 'Fabra Service', url: 'https://service.fabra.ge', domain: 'service.fabra.ge', label: 'service.fabra.ge',
    media: '/projects/fabra.gif', bg: '#16171C', glow: 'rgba(198,244,50,0.07)',
    text: {
      ka: { desc: 'სერვის ცენტრის სამუშაო სისტემა: ვიზიტები, ხელოსნები და საჯარო ფორმა პრობლემის დასაფიქსირებლად. ტექნიკოსი დღის გეგმას ერთ ეკრანზე ხედავს.', tags: ['ვებ აპლიკაცია', 'CRM'] },
      en: { desc: 'A work system for a service center: visits, technicians and a public form for reporting problems. Each technician sees the day plan on one screen.', tags: ['Web app', 'CRM'] },
      ru: { desc: 'Рабочая система сервисного центра: визиты, мастера и публичная форма для заявки о проблеме. Техник видит план дня на одном экране.', tags: ['Веб-приложение', 'CRM'] },
    },
  },
  {
    id: '02', title: 'თევზაო', url: 'https://tevzao.ge', domain: 'tevzao.ge', label: 'tevzao.ge',
    media: '/projects/tevzao.gif', bg: '#1B1410', glow: 'rgba(255,107,61,0.12)',
    text: {
      ka: { desc: 'თევზაობის რუკა მთელი საქართველოსთვის: მდინარეები, ტბები, კერძო მეურნეობები და მაღაზიები. ონლაინ ჯავშანი, დაჭერების დღიური და ფორუმი.', tags: ['პლატფორმა', 'რუკა', 'SEO'] },
      en: { desc: 'A fishing map for all of Georgia: rivers, lakes, private fisheries and shops. Online booking, a catch diary and a forum.', tags: ['Platform', 'Map', 'SEO'] },
      ru: { desc: 'Карта рыбалки по всей Грузии: реки, озёра, частные хозяйства и магазины. Онлайн-бронирование, дневник уловов и форум.', tags: ['Платформа', 'Карта', 'SEO'] },
    },
  },
  {
    id: '03', title: 'gemo.menu', url: 'https://gemo.menu', domain: 'gemo.menu', label: 'gemo.menu',
    media: '/projects/gemo.gif', bg: '#17141F', glow: 'rgba(139,108,255,0.14)',
    // The recording contains its own browser window, so it is cropped to the page.
    crop: { aspect: '756/395', left: '-2.91%', top: '-15.19%', width: '105.82%' },
    text: {
      ka: { desc: 'QR მენიუ ქართული რესტორნებისთვის. თხუთმეტი ენა, საკუთარი დიზაინი, შეკვეთა მაგიდიდან და სტატისტიკა. სტუმარს აპლიკაცია არ სჭირდება.', tags: ['SaaS', 'მობილური'] },
      en: { desc: 'A QR menu for Georgian restaurants. Fifteen languages, custom design, ordering from the table and statistics. Guests need no app.', tags: ['SaaS', 'Mobile'] },
      ru: { desc: 'QR-меню для грузинских ресторанов. Пятнадцать языков, собственный дизайн, заказ со стола и статистика. Гостю не нужно приложение.', tags: ['SaaS', 'Мобильный'] },
    },
  },
  {
    id: '04', title: 'pereezd.pet', url: 'https://pereezd.pet/en', domain: 'pereezd.pet/en', label: 'pereezd.pet',
    media: '/projects/pereezd.gif', bg: '#101619', glow: 'rgba(255,214,90,0.10)',
    text: {
      ka: { desc: 'შინაური ცხოველის საზღვარგარეთ გადაყვანის გეგმა: ვაქცინის ვადები, საბუთები ქვეყნების მიხედვით და შემოწმებული გადამზიდავები. ორენოვანი საიტი.', tags: ['ვებსაიტი', 'კალკულატორი'] },
      en: { desc: 'A plan for moving a pet abroad: vaccine deadlines, documents by country and vetted carriers. A bilingual site.', tags: ['Website', 'Calculator'] },
      ru: { desc: 'План переезда с питомцем за границу: сроки вакцин, документы по странам и проверенные перевозчики. Двуязычный сайт.', tags: ['Сайт', 'Калькулятор'] },
    },
  },
  {
    id: '05', title: 'Vouchvio', url: 'https://vouchvio.com', domain: 'vouchvio.com', label: 'vouchvio.com',
    media: '/projects/vouchvio.gif', bg: '#14161F', glow: 'rgba(91,108,255,0.14)',
    text: {
      ka: { desc: 'პრომო კოდებისა და ფასდაკლებების პლატფორმა: ასობით მაღაზია, ძიება, კატეგორიები და ყოველდღე განახლებული შეთავაზებები ერთ სივრცეში.', tags: ['ვებ პლატფორმა', 'კუპონები'] },
      en: { desc: 'A platform for promo codes and discounts: hundreds of stores, search, categories and deals updated every day in one place.', tags: ['Web platform', 'Coupons'] },
      ru: { desc: 'Платформа промокодов и скидок: сотни магазинов, поиск, категории и ежедневно обновляемые предложения в одном месте.', tags: ['Веб-платформа', 'Купоны'] },
    },
  },
  {
    id: '06', title: 'Foccaceria', url: 'https://foccaceria.ge', domain: 'foccaceria.ge', label: 'foccaceria.ge',
    media: '/projects/focacceria.gif', bg: '#1C1511', glow: 'rgba(229,111,60,0.14)',
    text: {
      ka: { desc: 'იტალიური საცხობის საიტი თბილისში: მენიუ, ფილიალები, ინსტაგრამის ლენტი და თბილი, ხელნაკეთი ვიზუალი, რომელიც ბრენდის ხასიათს ინარჩუნებს.', tags: ['ვებსაიტი', 'ბრენდინგი'] },
      en: { desc: 'A site for an Italian bakery in Tbilisi: menu, branches, an Instagram feed and warm, handmade visuals that keep the brand character.', tags: ['Website', 'Branding'] },
      ru: { desc: 'Сайт итальянской пекарни в Тбилиси: меню, филиалы, лента Instagram и тёплый, рукотворный визуал, сохраняющий характер бренда.', tags: ['Сайт', 'Брендинг'] },
    },
  },
];
