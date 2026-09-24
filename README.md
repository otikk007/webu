# Handoff: Webu — ვებ სტუდიის ლენდინგ გვერდი

> **Claude Code-ისთვის:** ეს დოკუმენტი საკმარისია საიტის 1:1 აწყობისთვის. გახსენი `Webu.dc.html` ბრაუზერში (იგივე ფოლდერიდან, `support.js`-თან ერთად) — ეს არის **ცოცხალი რეფერენსი**. ყველა ზომა, ფერი, ტექსტი და ანიმაცია იქედანაა ამოღებული და ქვემოთ აღწერილი.

---

## 1. Overview

Webu — ქართული ვებ სტუდია: ვებსაიტები, მობილური აპლიკაციები, SEO, UI/UX, ონლაინ მაღაზიები, ბრენდინგი, ჰოსტინგი. ერთგვერდიანი (single page) ლენდინგი, მუქი თემა, ლაიმისფერი აქცენტი, ბევრი მიკროინტერაქცია. ენა: **ქართული** (ყველა ტექსტი ზუსტად ქვემოთაა).

## 2. About the Design Files

`Webu.dc.html` არის **HTML დიზაინ-რეფერენსი** (პროტოტიპი), არა production კოდი. ამოცანაა მისი **ზუსტი ხელახალი აწყობა** რეალურ სტეკში.

**რეკომენდებული სტეკი (თუ სხვა არ არის):**
- **Next.js 14+ (App Router) + TypeScript**
- **Tailwind CSS** (ან CSS Modules) — ფერები/რადიუსები ტოკენებად (იხ. §9)
- ანიმაციები: უბრალო CSS keyframes + `requestAnimationFrame` (როგორც რეფერენსში). Framer Motion არ არის აუცილებელი.
- SEO: Next.js `metadata`, სემანტიკური HTML (`h1` ერთი, `h2` თითო სექციაზე), `lang="ka"`, OG ტეგები, `sitemap.xml`, `robots.txt`.
- ფონტები `next/font/google`-ით (ჩატვირთვას არ ბლოკავს).

რეფერენს ფაილის სტრუქტურა: `<x-dc>` შიგნით არის მარკაპი inline სტილებით, `{{ hole }}` ადგილები ივსება `class Component` ლოგიკიდან (`renderVals()`), ანიმირებული ელემენტები `React.createElement`-ით არის ლოგიკაში. რეალურ პროექტში ეს ყველაფერი ჩვეულებრივ React კომპონენტებად უნდა დაიშალოს.

## 3. Fidelity

**High-fidelity.** საბოლოო ფერები, ტიპოგრაფია, სპეისინგი, ტექსტები და ინტერაქციები. აიწყოს pixel-perfect.

---

## 4. Design Tokens

### ფერები
| Token | Hex | გამოყენება |
|---|---|---|
| `bg` | `#0E0F12` | გვერდის ფონი, მუქი ტექსტი ლაიმზე |
| `surface` | `#17181C` | ბარათები |
| `surface-2` | `#131418` | ბარათის ვიზუალის ზონა |
| `surface-3` | `#1b1c21` | შიდა ბლოკები ვიზუალებში |
| `line` | `rgba(255,255,255,0.06–0.1)` | ბორდერები/გამყოფები |
| `line-strong` | `rgba(255,255,255,0.18–0.28)` | outline ღილაკები |
| `ink` | `#F2F1EC` | ძირითადი ტექსტი; ღია სექციის ფონი |
| `ink-2` | `#D6D6DA` | |
| `muted` | `#B9B9BE` | აბზაცები |
| `muted-2` | `#9A9AA0` | მეორადი ტექსტი |
| `dim` | `#6E6F76` | არააქტიური ელემენტები |
| `off` | `#4A4B52` | გამორთული დღეები კალენდარში |
| `lime` (accent) | `#C6F432` | მთავარი აქცენტი |
| `violet` (accent 2) | `#8B6CFF` | ლოგოს მეორე წვეთი, ბეჯი, რინგის გრადიენტი |
| `dark-on-light` | `#44454b`, `#5b5c62` | ტექსტი ღია (#F2F1EC) ფონზე |
| footer bg | `#0a0a0c` | |
| neon lines | `#C6F432 #8B6CFF #34E0FF #FF4FD8 #FFB23F #4F7BFF` | ფუტერის ნეონი |

ლინკები: `a{color:#F2F1EC}` `a:hover{color:#C6F432}`.

### ტიპოგრაფია
- **Noto Sans Georgian** 400/500/600/700/800/900 — ყველა ტექსტი.
- **Unbounded** 800 — მხოლოდ `webu` ლოგოტიპი (ნავი, მობილური მენიუ, ფუტერი). ⚠️ იტვირთება ასინქრონულად (`display=swap`), რომ ჩატვირთვა არ დაბლოკოს.
- **JetBrains Mono** 400/500 — ნომრები, მცირე ლეიბლები, URL-ები, დრო.
- `-webkit-font-smoothing: antialiased`, `text-wrap: pretty` აბზაცებზე.

| როლი | ზომა | წონა | line-height | letter-spacing |
|---|---|---|---|---|
| H1 hero | `clamp(48px,10vw,160px)` | 800 | 1.02 | -0.02em |
| H2 სექცია | `clamp(36px,5.2vw,76px)` | 800 | 1.08 | -0.02em |
| H2 audit | `clamp(34px,4.6vw,64px)` | 800 | 1.08 | -0.02em |
| H3 დიდი ბარათი | 32px (SEO 30px) | 800 | — | — |
| H3 პატარა ბარათი | 24px | 700 | — | — |
| აბზაცი hero | `clamp(16px,1.4vw,19px)` | 400 | 1.65 | — |
| აბზაცი | 16px | 400 | 1.6 | — |
| mono ლეიბლი | 12–14px | 400 | — | — |
| ფუტერის wordmark | `clamp(64px,19vw,300px)` Unbounded | 800 | 0.9 | -0.06em |

### რადიუსები
`999px` (pill/ნავი/ჩიპები) · `14px` (ღილაკები) · `18px` (SERP სტრიქონი, ბრაუზერის ჩარჩო) · `28px` (audit შიდა ბარათები) · `32px` (ყველა ბარათი) · `40px` (audit სექციის კონტეინერი) · `50%` (წრიული ღილაკები).

### სპეისინგი
- კონტეინერი: `max-width:1320px`, გვერდითი padding `clamp(16px,4vw,48px)`.
- სექციებს შორის: `padding-top: clamp(72px,10vw,140px)`.
- ბარათების grid: `display:flex; flex-wrap:wrap; gap:16px`. ყველა ბარათს აქვს `flex: N 1 min(<basis>px,100%); min-width:0` (რომ მობილურზე არ გადავიდეს).
- ბარათის padding: 28px (ან `clamp(24px,3vw,40px)`).
- სათაურის ბლოკის ქვეშ: margin-bottom 48px.

### ღილაკის ტიპები
- **Primary goo** (lime, radius 14, padding 19px 30px, 700 16px, ტექსტი `#0E0F12`) — იხ. §7.1.
- **Outline** (radius 14, padding 18px 30px, border `1px rgba(255,255,255,0.28)`, hover border `#C6F432`).
- **Nav CTA** (pill, lime, padding 12px 22px, 600 14px, hover bg `#F2F1EC`).
- **Circle** 52px (ან 42/46px): transparent, border `1px rgba(255,255,255,0.22)`, hover: bg `#F2F1EC` ტექსტი `#0E0F12`.
- **ისრები:** არანაირი unicode ისარი (←→↗↓ აკრძალულია). ყველგან SVG: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` ორი path: `M4 12h15` და `M13 6l6 6-6 6`. მიმართულება `transform:rotate()`: მარჯვნივ 0°, მარცხნივ 180°, ↗ -45°. ხშირად წრეში ჩასმული (34–36px, ლაიმი ან მუქი ფონი).

---

## 5. გვერდის სტრუქტურა (ზემოდან ქვემოთ)

`nav` · `#top` Hero · `#services` · `#work` · `#process` · `#audit` · `#price` · `#faq` · `#contact` · `footer`

ყველა სექცია: `section > div(max-width 1320)`. გარე wrapper: `min-height:100vh; overflow-x:clip` (**არა** `overflow:hidden`, თორემ sticky header ტყდება).

### 5.1 Header / Nav
- `header` sticky top:0, z-index 50, padding `16px clamp(16px,4vw,48px)`.
- `nav` pill: radius 999, bg `rgba(23,24,28,0.94)` (**არა backdrop-filter** — პერფორმანსი), border `1px rgba(255,255,255,0.08)`, padding `8px 8px 8px 18px`, gap 24px (მობილურზე 8px).
- მარცხნივ: ლოგო (§7.6 ანიმირებული წვეთები, ზომა 20px) + `webu` (Unbounded 800, 21px, -0.04em). ლინკი `#top`.
- შუაში ლინკები (gap `clamp(14px,1.8vw,28px)`, font `clamp(12px,1.1vw,14px)`, nowrap): **სერვისები · ნამუშევრები · პროცესი · SEO აუდიტი · ფასი · კითხვები** → `#services #work #process #audit #price #faq`.
- მარჯვნივ CTA: **დაგვიკავშირდი** → `#contact`.
- **< 880px:** ლინკები და CTA იმალება; ჩნდება მენიუს ღილაკი (46px წრე, border `rgba(255,255,255,0.2)`, შიგნით ორი ხაზი: 18×2 `#F2F1EC` და 12×2 `#C6F432` margin-left 6, gap 5).
- **მობილური მენიუ** (overlay): `position:fixed; inset:0; z-index:140; bg #C6F432; color #0E0F12; padding 22px 24px 32px; flex column gap 32; overflow-y auto`. ზედა რიგი: `webu` (Unbounded 24px) + დახურვის ღილაკი (48px წრე, bg `#0E0F12`, ფერი lime, „✕“). შუაში ლინკები: font `clamp(30px,9vw,44px)` 800, padding 12px 0, border-bottom `1px rgba(14,15,18,0.18)`. ქვემოთ: **დაჯავშნე კონსულტაცია** (radius 14, bg `#0E0F12`, ტექსტი `#F2F1EC`, 700 17px, padding 18). ნებისმიერ ლინკზე დაჭერა ხურავს მენიუს.

### 5.2 Hero (`#top`)
- padding-top `clamp(40px,7vw,96px)`.
- **H1** — სამი ხაზი (flex column, gap 0.06em), თითოეული ხაზი `display:flex; align-items:center; gap:0.2em; flex-wrap:wrap`:
  1. `ვებსაიტი` + **Toggle** (§7.3)
  2. (padding-left `clamp(0px,8vw,140px)`) **Ring ღილაკი** (§7.4) + `აპლიკაცია`
  3. `და ` + `SEO` (lime ფერი) + **Bars pill** (§7.5)
- ხაზებს აქვს mouse parallax (§7.8), depth: 14 / -10 / 20.
- ქვემოთ (margin-top 48, flex space-between wrap, gap 40): აბზაცი max-width 520, ფერი `#B9B9BE`:
  > სრული ვებ სერვისი ერთ გუნდში. ვაპროექტებთ, ვაწყობთ და ვზრდით შენს ციფრულ პროდუქტს დიზაინის პირველი ესკიზიდან Google ის პირველ გვერდამდე.
- ღილაკები (gap 14): **დაიწყე პროექტი** (goo primary → `#contact`) + **დაითვალე ფასი** (outline → `#price`).
- **Hero ვიდეო ჩარჩო** (margin-top 64, radius 32, overflow hidden, bg `#15161a`, `aspect-ratio:16/8` desktop, `4/3` < 880px, width 100%): `assets/hero-laptop.mp4`, poster `assets/s-hero.jpg`, muted loop playsinline, `object-fit:cover`. ზედ ტექსტი/ოვერლეი **არ არის**. Scroll-ზე scale 0.88→1 (§7.9).

### 5.3 Services (`#services`)
სათაურის რიგი (flex space-between, wrap, gap 24, margin-bottom 48):
- H2 (flex 1 1 560, max-width 900): **ყველაფერი, რაც შენს ბიზნესს ინტერნეტში სჭირდება**
- აბზაცი (flex 0 1 340, `#9A9AA0`): **ერთი კონტაქტი, ერთი გუნდი, ერთი პასუხისმგებლობა. აღარ გჭირდება ხუთ სხვადასხვა კომპანიასთან ურთიერთობა.**

ბარათები (flex wrap gap 16), თანმიმდევრობით:

1. **01 ვებსაიტები** — flex `1 1 620`, bg `#17181C`, border `rgba(255,255,255,0.06)`, column. ზედა ზონა `aspect-ratio 16/9`, bg `#131418`, border-bottom → **Web build ანიმაცია** (§7.10). ქვედა padding 28: mono `01` (lime 12px), H3 `ვებსაიტები`, ტექსტი: *ლენდინგები, კორპორატიული საიტები და ონლაინ მაღაზიები, რომლებიც სწრაფად იტვირთება და ყიდის.* + ჩიპები `Next.js` `Webflow` `Shopify` (pill, padding 8×14, border `rgba(255,255,255,0.16)`, 13px).
2. **02 მობილური აპლიკაციები** — flex `1 1 400`, min-height 480, bg lime, ტექსტი `#0E0F12`, padding 28, column space-between. ზემოთ: `02` + დეკორი (56px შავი წრე + 56px outline წრე border 2px, margin-left -16). ქვემოთ: H3, ტექსტი *iOS და Android აპები ერთი კოდით ან ნატიურად. დიზაინიდან App Store ში განთავსებამდე.*, სია (border-top/bottom `rgba(14,15,18,0.2)`, padding 14 0, 500): `React Native`, `Flutter`, `Swift და Kotlin` — თითოს მარჯვნივ 34px შავი წრე lime ↗ ისრით.
3. **03 SEO ოპტიმიზაცია** — flex `1 1 440`, bg `#F2F1EC`, ტექსტი `#0E0F12`, padding 28, gap 28. ზემოთ საძიებო ველი (pill, bg white, border `rgba(14,15,18,0.1)`, 14px outline წრე + `ვებსაიტის დამზადება თბილისში`). შუაში **SERP ანიმაცია** (§7.11, სიმაღლე 292). ქვემოთ `03`, H3, ტექსტი *ტექნიკური აუდიტი, კონტენტის სტრატეგია და ბმულები. ამოდი ხმაურიდან და იყავი პირველი.* (`#44454b`).
4. **04 UI და UX დიზაინი** — flex `1 1 580`, column. ზედა ზონა min-height 320, bg `#131418` → **UI editor ანიმაცია** (§7.12). ქვემოთ padding 28: `04`, H3, *ინტერფეისები, რომლებსაც ხალხი ეხება, არა უბრალოდ უყურებს. მიკროანიმაციები, დიზაინ სისტემები, პროტოტიპები.*
5–7. პატარა ბარათები (flex `1 1 300`, bg `#17181C`, padding 28, column space-between gap 40, hover border `rgba(198,244,50,0.5)`):
   - `05` **ონლაინ მაღაზია** — გადახდები ქართულ ბანკებთან, მარაგის მართვა, მიწოდება.
   - `06` **ბრენდინგი** — ლოგო, ფერები, შრიფტები და ვიზუალური ენა, რომელიც გამოგარჩევს.
   - `07` **ჰოსტინგი და მხარდაჭერა** — სერვერები, უსაფრთხოება, განახლებები. შენ ბიზნესს მართავ, ჩვენ საიტს.

### 5.4 Work (`#work`)
სათაური: H2 **პროექტები, რომლებითაც ვამაყობთ** + მარჯვნივ მრიცხველი `01 / 04` (mono 14 `#9A9AA0`) და ორი 52px წრიული ისრის ღილაკი (prev/next).

ლეიაუტი (flex wrap gap 16):
- **Stage** (flex `2 1 640`, radius 32, overflow hidden, `aspect-ratio 16/10`, bg `#17181C`, cursor pointer, click = next). 4 სლაიდი ერთმანეთზე absolute, აქტიურს opacity 1, დანარჩენს 0:
  0. `assets/laptop-color.mp4` (poster `c-laptop.jpg`) — ვიდეო
  1. `assets/c-hero.jpg` · 2. `assets/c-city.jpg` · 3. `assets/c-sculpture.jpg` — სურათები Ken Burns ანიმაციით: `@keyframes kb{from{transform:scale(1) translate(0,0)}to{transform:scale(1.12) translate(-2%,-1.5%)}}` 9s ease-in-out infinite alternate.
  - ზედ **stripe wipe** ოვერლეი (§7.7) და ქვემოთ 3px progress bar (track `rgba(255,255,255,0.12)`, fill lime, width 0→100% linear 5200ms).
  - ⚠️ ტექსტი/ლეიბლი სურათზე **არ დაიდოს**.
- **სია** (flex `1 1 320`, border-top): 4 ღილაკი-სტრიქონი (padding 22px 4px, border-bottom, აქტიურზე padding-left 16 + ფერი lime, transition .3s). სახელი `clamp(20px,1.8vw,26px)` 700, კატეგორია 13 `#9A9AA0`, წელი mono 13.

| # | სახელი | კატეგორია | წელი |
|---|---|---|---|
| 1 | ტექსტილ მარკეტი | ონლაინ მაღაზია | 2026 |
| 2 | ჰორიზონტი | SaaS პლატფორმა, ვებსაიტი | 2025 |
| 3 | ქალაქი 3D | არქიტექტურა, ინტერაქტიული საიტი | 2025 |
| 4 | ოქროს ხაზი | ინვესტიციები, კორპორატიული საიტი | 2024 |

ავტომატური გადართვა ყოველ 5200ms. (placeholder პროექტებია — კლიენტი ჩაანაცვლებს.)

### 5.5 Process (`#process`)
H2 **ოთხი ნაბიჯი იდეიდან შედეგამდე** (mb 48). ორი სვეტი (flex wrap gap 16):
- მარცხნივ (flex `1 1 420`): 4 ღილაკი-სტრიქონი (padding 26px 8px, border-bottom, gap 24): mono ნომერი 14px (width 32) · სათაური `clamp(22px,2.4vw,34px)` 700 · 44px წრე ისრით (აქტიური bg lime, სხვა `rgba(255,255,255,0.08)`). არააქტიური ტექსტი `#6E6F76`, აქტიური `#F2F1EC`.
- მარჯვნივ ბარათი (flex `1 1 420`, min-height 420, padding `clamp(24px,3vw,40px)`): დიდი ნომერი `clamp(80px,10vw,140px)` 900 lime + დროის pill (mono 13, bg `rgba(255,255,255,0.06)`), ქვემოთ ტექსტი 19px `#D6D6DA` + output ჩიპები (border `rgba(255,255,255,0.16)`, 14px).

| n | სათაური | დრო | ტექსტი | ჩიპები |
|---|---|---|---|---|
| 01 | აუდიტი და სტრატეგია | 1 კვირა | ვსწავლობთ შენს ბიზნესს, კონკურენტებს და მომხმარებელს. ვადგენთ რა უნდა გააკეთოს საიტმა და როგორ გავზომოთ წარმატება. | ბაზრის ანალიზი · საიტის სტრუქტურა · საკვანძო სიტყვები |
| 02 | დიზაინი | 2 კვირა | ვქმნით ვიზუალურ ენას და ინტერაქტიულ პროტოტიპს. ყველა ეკრანს ნახავ და შეეხები კოდის დაწერამდე. | დიზაინ სისტემა · პროტოტიპი · მობილური ვერსია |
| 03 | დეველოპმენტი | 3 დან 8 კვირამდე | ვწერთ სუფთა და სწრაფ კოდს. ყოველ კვირას იღებ სამუშაო ვერსიას, რომ პროცესს რეალურ დროში ადევნო თვალი. | ფრონტენდი · ადმინ პანელი · ინტეგრაციები |
| 04 | გაშვება და ზრდა | მუდმივად | ვუშვებთ, ვზომავთ და ვაუმჯობესებთ. SEO, ანალიტიკა და ტექნიკური მხარდაჭერა გაშვების შემდეგაც გრძელდება. | SEO ოპტიმიზაცია · ანალიტიკა · მხარდაჭერა |

### 5.6 SEO Audit (`#audit`)
კონტეინერი: radius 40, bg `#F2F1EC`, ტექსტი `#0E0F12`, padding `clamp(24px,4vw,56px)`, flex wrap gap `clamp(24px,4vw,56px)`.
- მარცხნივ: H2 **რამდენად გხედავს Google?**, ტექსტი *ჩაწერე შენი საიტის მისამართი და მიიღე სწრაფი შეფასება. სრულ ანგარიშს 24 საათში გამოგიგზავნით.* (`#44454b`). Input pill (bg white, border `rgba(14,15,18,0.1)`, padding 8, max-width 520): input placeholder `shenisaiti.ge` + ღილაკი **შემოწმება** (bg `#0E0F12`, pill, padding 14×24, 600 15). Enter-იც მუშაობს.
- მარჯვნივ ორი თეთრი ბარათი (radius 28, padding 24):
  - Score ring: SVG 200×200, `r=74`, stroke 14, track `#ECEBE6`, პროგრესი gradient `#C6F432→#8B6CFF`, `stroke-dasharray:465`, offset `465*(1-avg/100)`, transition 1.2s `cubic-bezier(.2,.8,.2,1)`. ცენტრში რიცხვი 56px 800 + ნოტა 13px.
  - 4 მეტრიკა bar (8px, track `#ECEBE6`, fill `#0E0F12`, width transition 1.1s): **სიჩქარე · ტექნიკური SEO · მობილური · კონტენტი**.
- ლოგიკა (demo): დაჭერისას 1500ms „სკანირება...“, შემდეგ URL-ის hash-იდან 4 მნიშვნელობა 52–95. ნოტა: >80 **კარგი შედეგია**, >65 **არის რეზერვი**, სხვა **საჭიროებს ყურადღებას**; საწყისი **საერთო ქულა**, სკანისას **ვამოწმებთ**. რეალურ პროექტში → API (PageSpeed Insights) ან ლიდის ფორმა.

### 5.7 Price calculator (`#price`)
H2 **ააწყე პროექტი, ნახე ფასი**. ორი ბარათი:
- მარცხნივ (flex `2 1 560`): „რა გჭირდება?“ — ერთი არჩევანი (radius 14, padding 16×22, 600 16; აქტიური bg `#F2F1EC` ტექსტი მუქი):

| id | ლეიბლი | ფასი ₾ | კვირა |
|---|---|---|---|
| land | ლენდინგი | 1200 | 2 |
| corp | კორპორატიული საიტი (default) | 2800 | 4 |
| shop | ონლაინ მაღაზია | 5200 | 7 |
| app | მობილური აპი | 8500 | 10 |

  „დამატებით“ — multi toggle (18px წრე ივსება lime-ით, border lime):

| id | ლეიბლი | +₾ | +კვირა |
|---|---|---|---|
| seo | SEO პაკეტი (default ჩართული) | 900 | 1 |
| lang | მრავალენოვანი | 600 | 1 |
| admin | ადმინ პანელი | 1400 | 2 |
| brand | ბრენდინგი | 1100 | 2 |

- მარჯვნივ lime ბარათი (flex `1 1 320`): „სავარაუდო ბიუჯეტი“, თანხა `clamp(48px,5vw,72px)` 900 tabular-nums, ფორმატი `3 700 ₾` (ათასების გამყოფი space), „ვადა: დაახლოებით N კვირა“, ღილაკი **დაჯავშნე ზარი** (bg `#0E0F12`, radius 14, მარჯვნივ 36px lime წრე ისრით) → `#contact`.
- თანხის ცვლილებისას **count-up** 700ms, easeOutCubic.

### 5.8 FAQ (`#faq`)
ორი სვეტი:
- მარცხნივ: H2 **ხშირად გვეკითხებიან** + lime ბარათი (radius 32, min-height 340, padding `clamp(24px,3vw,36px)`): დეკორი (84px outline წრე „?“ 40px 800 + 84px შავი წრე margin-left -22), H3 **პასუხი ვერ იპოვე?**, ტექსტი *მოგვწერე და სამუშაო საათებში ერთ საათში გიპასუხებთ.*, ღილაკები: `hello@webu.ge` (mailto, შავი radius 14 + lime წრე ↗) და `+995 555 12 34 56` (tel, outline `rgba(14,15,18,0.35)`).
- მარჯვნივ accordion (ერთი ღია ერთდროულად, default პირველი). კითხვა `clamp(18px,1.8vw,24px)` 600, padding 28 0; „+“ 40px წრე — ღიაზე rotate 45° და bg lime. პასუხი 16px `#B9B9BE` max-width 560.

| კითხვა | პასუხი |
|---|---|
| რამდენი ხანი სჭირდება საიტის აწყობას? | ლენდინგი მზად არის 2 კვირაში, კორპორატიული საიტი 4 დან 6 კვირამდე, ონლაინ მაღაზია და აპლიკაცია 2 დან 3 თვემდე. ზუსტ გრაფიკს პირველი შეხვედრის შემდეგ მიიღებ. |
| შემიძლია საიტი თავად ვმართო? | კი. ყველა პროექტს მოყვება მარტივი ადმინ პანელი და ვიდეო ინსტრუქცია, ასე რომ ტექსტს, ფოტოებს და პროდუქტებს თავად შეცვლი. |
| როდის გამოჩნდება შედეგი SEO ში? | პირველ ცვლილებებს 4 დან 8 კვირაში შენიშნავ. სტაბილური ზრდა ჩვეულებრივ 3 დან 6 თვემდე პერიოდში ყალიბდება. ყოველთვიურად ვაგზავნით ანგარიშს. |
| როგორ ხდება გადახდა? | ეტაპობრივად: 40 პროცენტი დაწყებისას, 30 დიზაინის დამტკიცებისას და დანარჩენი გაშვებისას. SEO და მხარდაჭერა ყოველთვიური გადასახადია. |
| უკვე მაქვს საიტი. შეგიძლიათ გააუმჯობესოთ? | რა თქმა უნდა. ვიწყებთ აუდიტით, შემდეგ ვწყვეტთ ღირს თუ არა არსებულის განახლება, თუ ჯობია თავიდან აწყობა. |

### 5.9 Contact / Booking (`#contact`)
H2 **დაჯავშნე 30 წუთიანი უფასო კონსულტაცია** (max-width 980).
- **კალენდარი** (flex `1 1 460`): თვის ნავიგაცია (42px წრეები ← → + pill `rgba(198,244,50,0.14)` ტექსტი lime, min-width 170, მაგ. „სექტემბერი 2026“). კვირის დღეები: **ორშ სამ ოთხ ხუთ პარ შაბ კვი** (ორშაბათიდან). Grid `repeat(7,minmax(0,1fr))` gap 6; დღე — წრე max 52px, 16px. წარსული დღეები და შაბათ-კვირა გამორთული (`#4A4B52`); დღევანდელს `inset 0 0 0 1px #C6F432`; არჩეულს bg lime.
- **დრო** ბარათი: `10:00 11:30 13:00 15:00 16:30` (radius 14, mono 14, არჩეული lime).
- **შეჯამება** lime ბარათი: „შენი შეხვედრა“ + ტექსტი `clamp(24px,2.4vw,32px)` 800:
  - არაფერი: **აირჩიე დღე და დრო** · მხოლოდ დღე: **{d} {თვე ნათესაობითში}, აირჩიე დრო** · ორივე: **24 სექტემბერს, 13:00** · დადასტურების შემდეგ: **დაჯავშნილია! დაგიკავშირდებით მალე**
  - თვეები ნათესაობითში: იანვარს თებერვალს მარტს აპრილს მაისს ივნისს ივლისს აგვისტოს სექტემბერს ოქტომბერს ნოემბერს დეკემბერს.
  - ღილაკი **დადასტურება** → **მადლობა** (goo ღილაკი, მუქი ვარიანტი: bg/წვეთები `#0E0F12`, ტექსტი `#F2F1EC`). რეალურში → API/Calendly/Google Calendar + მეილი.

### 5.10 Footer
- bg `#0a0a0c`, overflow hidden, margin-top `clamp(72px,10vw,140px)`. ფონად **neon lines** (§7.13), ზედ gradient `linear-gradient(180deg,#0E0F12 0%,rgba(14,15,18,0) 30%,rgba(14,15,18,0) 60%,rgba(14,15,18,0.85) 100%)`.
- ზედა რიგი: კონტაქტი (17px): `+995 555 12 34 56` (tel), `hello@webu.ge` (mailto), `თბილისი, ვაჟა ფშაველას 71` (`#9A9AA0`); ლინკები: სერვისები/ნამუშევრები/SEO აუდიტი + Instagram/LinkedIn/Behance.
- დიდი wordmark: `w` `e` `b` `u` ცალკე span-ებად (Unbounded 800) + დიდი ლოგო-წვეთები (0.6em, §7.6). ასოები მაუსს გაურბიან (§7.8).
- ქვედა: `© 2026 Webu` · `კონფიდენციალურობა` (mono 13 `#9A9AA0`).
- ⚠️ ტელეფონი და მისამართი placeholder-ია.

---

## 6. Responsive
- Breakpoint JS/CSS: **< 880px** = mobile nav (მენიუს ღილაკი, CTA დამალული, nav gap 8), hero ვიდეო 4/3.
- ყველა ბარათი: `flex: N 1 min(Bpx,100%); min-width:0` → ვიწროზე თითო ხაზზე ერთი.
- ტიპოგრაფია `clamp()`-ით (იხ. §4).
- Touch მოწყობილობებზე (`(hover:hover) and (pointer:fine)` false): goo tail, cursor ring, magnetic, tilt, parallax **გამორთულია**. დანარჩენი ანიმაციები მუშაობს.
- `prefers-reduced-motion: reduce` → რეკომენდებულია ყველა loop ანიმაციის გამორთვა (რეფერენსში `animations` prop აკეთებს ამას).

---

## 7. Interactions & Animations (ზუსტი)

### 7.1 Goo („თხევადი“) ღილაკი — მთავარი CTA
სტრუქტურა: wrapper `position:relative; display:inline-flex` → (a) ფენა `position:absolute; inset:-170px; filter:url(#goo); pointer-events:none`, შიგნით ღილაკის ფონი (`inset:170px`, lime, radius 14) + 4 წრე (28, 20, 14, 18px diameter, lime) → (b) ზემოდან ტექსტი/ლინკი (`position:relative`).
SVG filter:
```html
<filter id="goo" x="-20%" y="-20%" width="140%" height="140%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b"/>
  <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" result="g"/>
  <feComposite in="SourceGraphic" in2="g" operator="atop"/>
</filter>
```
ლოგიკა (rAF, მხოლოდ mousemove-ის დროს; 20 უმოძრაო კადრის შემდეგ ჩერდება):
- anchor: `ax = clamp(mouseX, rect.left+22, rect.right-22)`, `ay = rect.bottom-6`.
- `attached = !inside && dist(mouse,anchor)<150 && mouseY > rect.top + rect.height*0.4`.
- target = attached ? mouse : (ax, ay-10). Spring: `v = (v + (target-pos)*0.2)*0.7; pos += v`.
- წრე i პოზიცია: `anchor + (pos-anchor)*T[i]`, `T=[0.28,0.55,0.8,1]`, transform translate (ფენის origin = rect.left-170, rect.top-170).
შედეგი: ღილაკიდან იჭიმება ლაიმისფერი წვეთი და მიჰყვება კურსორს; 150px-ზე წყდება და spring-ით ბრუნდება.

### 7.2 Section reveal (scroll)
- ბარათები (radius 32/40), process/faq/work ღილაკები: საწყისი `opacity:0; transform:translateY(48px)` → IntersectionObserver (threshold 0.1, rootMargin `0px 0px -5% 0px`) → `opacity:1; transform:none`. transition `opacity .8s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)`, stagger = min(index,5)*0.07s.
- H2: `clip-path: inset(0 0 100% 0); translateY(40px)` → `inset(0 0 -20% 0); none`, transition clip-path 1s `cubic-bezier(.7,0,.2,1)`. ⚠️ ტრიგერი **scroll handler-ში** (`rect.top < innerHeight*0.9`), არა IO-ით (სრულად clip-ულ ელემენტს IO ვერ ხედავს).
- Scroll progress bar: fixed top, 3px, lime, `transform:scaleX(progress)` origin left, z 120.

### 7.3 Toggle (hero, „ვებსაიტი“)
Button 1.7em×0.7em pill, bg off `#23242a` / on `#C6F432` (+ glow `0 0 0.3em rgba(198,244,50,0.45)`), transition .45s `cubic-bezier(.7,0,.3,1)`. Knob 0.5em, left/top 0.1em, off `#F2F1EC` / on `#0E0F12`, `translateX(0→1em)` .5s `cubic-bezier(.5,1.6,.4,1)`. Click = toggle. ჩატვირთვიდან 1400ms-ში ავტომატურად ირთვება.

### 7.4 Ring (hero, „აპლიკაცია“)
0.7em წრე, border 2px lime. Click: scale 0.78 → 160ms-ში 1 (`cubic-bezier(.5,1.8,.4,1)` .45s); ივსება lime; ripple (border ring, scale 1→2.4, opacity .9→0, .7s); ბეჯი (violet `#8B6CFF`, ზედა მარჯვენა კუთხე) რიცხვით — ყოველ click-ზე +1 (max 99), pop-in scale 0→1.

### 7.5 Bars pill (hero, „SEO“)
2.2em×0.7em pill, bg `#17181C`, border `rgba(255,255,255,0.1)` (hover lime). 6 სვეტი (gap 0.09em), ბოლო lime, სხვა `#3a3b42`. საწყისი სიმაღლეები `22,36,50,68,86,100%` (ჩატვირთვიდან 500ms-ში იზრდება 8%-დან). Click → ახალი შემთხვევითი სიმაღლეები 15–85%, ბოლო ყოველთვის 100%. transition height .7s `cubic-bezier(.4,1.5,.4,1)`, delay i*0.06s.

### 7.6 Logo mark (ანიმირებული წვეთები)
ზომა `s` (nav 20px, footer 0.6em). კონტეინერი `1.95s × 1.2s`, filter goo-s (std 2.4, matrix `0 0 0 20 -8`) ან goo-l (std 9, `0 0 0 22 -9`).
- A lime Ø1s (left 0, top 0): `lgA` scale 1↔1.08.
- C lime Ø0.34s (left .33s, top .62s): `lgC` — ქვემოთ „წვეთავს“ და ქრება.
- B violet Ø0.62s (left 1.3s, top .19s): `lgB` — მიდის A-სკენ (`--d:-0.58s`), ერწყმის, ბრუნდება.
```css
@keyframes lgA{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes lgB{0%,12%{transform:translate(0,0)}42%,56%{transform:translate(var(--d),0)}86%,100%{transform:translate(0,0)}}
@keyframes lgC{0%,48%{transform:translate(0,0) scale(.3)}62%{transform:translate(0,var(--f)) scale(1)}80%,100%{transform:translate(0,calc(var(--f)*1.8)) scale(0)}}
```
დრო: nav 4.5s, footer 6s. Easing B `cubic-bezier(.65,0,.35,1)`, C `cubic-bezier(.5,0,.5,1)`.

### 7.7 Work stripe wipe
8 ჰორიზონტალური ზოლი (flex column, lime), `transform:scaleX(0|1)`, transition .42s `cubic-bezier(.7,0,.25,1)`, delay i*0.045s.
ფაზები: `cover` (origin left, scaleX 1) 750ms → სლაიდის შეცვლა → `reveal` (origin right, scaleX 0) 750ms → `idle`. ფაზის დროს სხვა click იგნორირდება.

### 7.8 Mouse-follow ეფექტები (მხოლოდ fine pointer)
- **Cursor ring:** fixed 32px, border 1.5px `rgba(198,244,50,0.8)`, lerp 0.22. ლინკ/ღილაკზე 54px + bg `rgba(198,244,50,0.14)`; Work stage-ზე 96px bg lime + ლეიბლი **შემდეგი** (12px 700 მუქი); input-ზე ქრება. ზომის transition .35s `cubic-bezier(.5,1.6,.4,1)`. ფანჯრიდან გასვლისას opacity 0. native cursor რჩება.
- **Magnetic:** hover-ზე ლინკი/ღილაკი იწევს კურსორისკენ (CSS `translate`, არა transform): x = offset*0.28 (max ±12px), y = offset*0.38 (max ±9px). გამოსვლისას `translate .5s cubic-bezier(.5,1.6,.4,1)` → 0. გამონაკლისი: goo ღილაკები, nav ტექსტ-ლინკები, stage.
- **Card tilt + spotlight:** radius-32 ბარათებზე `perspective(1100px) rotateX(-ny*4deg) rotateY(nx*5deg)` (transition .18s), გამოსვლისას .7s → none. `background-image: radial-gradient(420px circle at x y, <c>, transparent 65%)` — მუქ ბარათზე `rgba(198,244,50,0.09)`, ღიაზე `rgba(255,255,255,0.45)`.
- **Hero parallax:** ხაზების `translate = (nx*depth, ny*depth*0.5)`, nx/ny = mouse/viewport − 0.5. მხოლოდ `scrollY < 1.2*innerHeight`.
- **Footer letters repel:** რადიუსი 260px, f = 1 − d/260; translate = მიმართულება*f*(28px x, 38px y); f > 0.35 → ფერი lime.

### 7.9 Hero frame scale
scroll-ზე (rAF-throttled): `k = clamp((innerHeight - rect.top)/(innerHeight*0.9), 0, 1)`, `scale(0.88 + 0.12k)`.

### 7.10 Web build ანიმაცია (ბარათი 01) — loop 6s
ბრაუზერის ჩარჩო (inset clamp(16px,4%,32px), bottom 0, radius 18 18 0 0, bg `#0E0F12`): 3 წერტილი 9px `#2a2b31` + URL pill `webu.ge`. შიგნით ელემენტები თანმიმდევრულად ჩნდება `wbuild`-ით (delay): nav (0.1s), სათაურის ბარები 68%/44% 16px `#F2F1EC` (0.35/0.5s), ქვესათაური 56%/38% 6px `#3a3b42` (0.7/0.8s), ლაიმის ღილაკი „დაიწყე“ (1.0s), 3 ბარათი (1.3/1.45/1.6s). კურსორი მიდის ღილაკზე და „აჭერს“ (wcur/wpress/wring), შემდეგ ამოხტება ბეჯი 64px lime **100 / სიჩქარე** (wpop).
```css
@keyframes wbuild{0%{opacity:0;transform:translateY(14px)}10%,84%{opacity:1;transform:none}94%,100%{opacity:0;transform:translateY(-6px)}}
@keyframes wcur{0%,34%{opacity:0;transform:translate(150px,90px)}42%{opacity:1}54%{transform:translate(28px,14px)}57%{transform:translate(28px,14px) scale(.8)}61%{transform:translate(28px,14px) scale(1)}84%{opacity:1;transform:translate(28px,14px)}94%,100%{opacity:0;transform:translate(28px,14px)}}
@keyframes wpress{0%,56%{transform:scale(1)}58.5%{transform:scale(.9)}62%,100%{transform:scale(1)}}
@keyframes wring{0%,57%{opacity:0;transform:scale(.4)}60%{opacity:.9}72%,100%{opacity:0;transform:scale(2.2)}}
@keyframes wpop{0%,62%{transform:scale(0)}69%{transform:scale(1.12)}73%,84%{transform:scale(1)}92%,100%{transform:scale(0)}}
```

### 7.11 SERP ანიმაცია (ბარათი 03)
4 სტრიქონი (absolute, სიმაღლე 64, ნაბიჯი 76px, radius 18, bg white): პოზიცია `#N` mono, სათაური 700 15 (ellipsis), URL mono 12.
საწყისი რიგი: `ვებ სტუდია პლიუსი / webplus.ge`, `საიტები ყველასთვის / saitebi.ge`, `დიჯიტალ ჰაბი / dhub.ge`, `შენი ბიზნესი, პირველ ადგილზე / shenisaiti.ge` (#4).
ბარათი ხილვადობაში შემოსვლისას (IO threshold 0.4, +500ms) „შენი“ სტრიქონი ადის #1-ზე და ხდება lime, სხვები ერთით ქვემოთ. transition transform 1.1s `cubic-bezier(.6,0,.2,1)`, სხვებს delay .15s. ერთჯერადი.

### 7.12 UI editor ანიმაცია (ბარათი 04) — loop 8s
ფონი: dot grid `radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)` 18px. კომპონენტის ბარათი (left 20%, top 12%, w 44%, h 76%, bg `#1b1c21`, radius 14): სურათის ბლოკი, ორი ტექსტის ბარი, ღილაკი „ღილაკი“. მონიშვნის ჩარჩო (1.5px lime, 4 კუთხის სახელური 7px) გადადის: მთლიანი ბარათი → სურათი → ღილაკი. ღილაკის ფერი იცვლება lime → violet → მუქი → lime, და sync-ში მოძრაობს ფერების პანელის (მარჯვნივ: **ფერი** / ლაიმი, იისფერი, მუქი) აქტიური ჩარჩო.
```css
@keyframes usel{0%,24%{left:19%;top:10.5%;width:46%;height:79%}32%,54%{left:21.6%;top:14.8%;width:40.7%;height:36.2%}62%,92%{left:21.6%;top:71%;width:24%;height:12.6%}100%{left:19%;top:10.5%;width:46%;height:79%}}
@keyframes ubtn{0%,64%{background:#C6F432;color:#0E0F12}70%,78%{background:#8B6CFF;color:#F2F1EC}84%,90%{background:#0E0F12;color:#F2F1EC}97%,100%{background:#C6F432;color:#0E0F12}}
@keyframes uswatch{0%,64%{transform:translateY(0)}70%,78%{transform:translateY(44px)}84%,90%{transform:translateY(88px)}97%,100%{transform:translateY(0)}}
@keyframes uimg{0%,30%{background:#2a2b31}38%,54%{background:#3a3160}62%,100%{background:#2a2b31}}
```

### 7.13 Footer neon lines
SVG `viewBox 0 0 1440 720`, `preserveAspectRatio="xMidYMid slice"`. 18 „კიბისებრი“ ხაზი: `M x0 y H x0+a V y+dy H x0+a+b` (y = 30 + i*38 + rand*14; x0 −60..1040; a 120..380; b 140..460; dy ±(24..74)). თითოეული: ფონის ხაზი stroke `#1f2027` 1.5px + ნათება stroke ფერი (ციკლურად 6 ნეონ ფერიდან), 2.5px, round cap, `pathLength=1000`, `stroke-dasharray:80 1000`, `@keyframes trace{from{stroke-dashoffset:1080}to{stroke-dashoffset:0}}` duration 4–8s linear infinite, უარყოფითი delay 0..−8s. RNG seeded (`s=(s*9301+49297)%233280`, seed 7) — სტაბილური ლეიაუტი.

### 7.14 ნავიგაცია
Anchor ლინკები → `scrollTo({top: el.offsetTop - 90, behavior:'smooth'})`. (full-screen overlay გადასვლა და click-ნაწილაკები **წაშლილია** — არ დაამატო.)

---

## 8. State
| state | ტიპი | default |
|---|---|---|
| step (process) | 0–3 | 0 |
| url, scan, res[4] (audit) | string/bool/number[] | '', false, null |
| type, add{} (price) | id / map | 'corp', {seo:true} |
| faq (ღია index, -1 = დახურული) | number | 0 |
| cal{y,m}, selD{y,m,d}, selT, done | booking | მიმდინარე თვე |
| wi, wphase ('idle'/'cover'/'reveal') | work | 0, 'idle' |
| serp (0/1) | | 0 |
| tg, ringN, barsK | hero icons | false, 0, 0 |
| narrow (<880), menu | | |

## 9. Performance (მნიშვნელოვანი — კლიენტმა „ჭედავს“ აღნიშნა)
- ვიდეოები მხოლოდ ხილვადობისას უკრავს (IntersectionObserver play/pause, threshold 0.05), `preload="metadata"`, poster ყოველთვის.
- **ვიდეოები შეკუმშე:** `hero-laptop.mp4` (~20MB, 2400×1800) და `laptop-color.mp4` (~17MB) → H.264/WebM 1280–1600px, ~2–4MB, `-movflags +faststart`. მაგ.: `ffmpeg -i in.mp4 -vf scale=1600:-2 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart out.mp4`.
- სურათები → WebP/AVIF (`next/image`), lazy.
- backdrop-filter არ გამოიყენო ვიდეოებზე. mix-blend-mode არ გამოიყენო კურსორზე.
- scroll/mouse handler-ები rAF-throttled; მხოლოდ `transform`/`opacity`/`translate` ანიმაციები.
- ფონტები `display=swap`, Unbounded მხოლოდ ლოგოსთვის (შეიძლება `text=webu` subset).

## 10. Assets (`assets/`)
| ფაილი | სად |
|---|---|
| `hero-laptop.mp4` + `s-hero.jpg` (poster) | Hero ჩარჩო |
| `laptop-color.mp4` + `c-laptop.jpg` (poster) | Work სლაიდი 1 |
| `c-hero.jpg` | Work სლაიდი 2 |
| `c-city.jpg` | Work სლაიდი 3 |
| `c-sculpture.jpg` | Work სლაიდი 4 |

ყველა მასალა კლიენტის მოწოდებული რეფერენს ვიდეოებიდანაა — **production-ამდე ჩაანაცვლე საკუთარი პროექტების რეალური მასალით** (ზოგი სხვა ბრენდის მოკაპს შეიცავს).

## 11. Content rules (კლიენტის მოთხოვნები)
- არანაირი emoji, არანაირი „AI“-ს სტილის ელემენტები/ლოგოები.
- ტექსტებში **ტირეები არ გამოიყენო** (—, –, „ -“) — მძიმე ან წერტილი.
- ტექსტი სურათებზე/ვიდეოებზე არ დაიდოს.
- Unicode ისრები აკრძალულია — მხოლოდ SVG ისარი (§4).
- სექციის ნომრის ლეიბლები („(01) სერვისები“) და „ვიღებთ ახალ პროექტებს“ ბეჯი **წაშლილია** — არ დაამატო.

## 12. Placeholder-ები ჩასანაცვლებლად
ტელეფონი `+995 555 12 34 56`, მისამართი `თბილისი, ვაჟა ფშაველას 71`, მეილი `hello@webu.ge`, სოციალური ლინკები, ფასები, პროექტების სახელები/სურათები, SERP კონკურენტების სახელები, audit-ის demo ლოგიკა, booking-ის backend.

## 13. Files
- `Webu.dc.html` — სრული ცოცხალი რეფერენსი (მარკაპი + ლოგიკა `class Component`-ში, ყველა keyframe `<helmet><style>`-ში).
- `support.js` — რეფერენსის runtime (მხოლოდ HTML-ის გასახსნელად; production-ში არ გამოიყენება).
- `assets/` — მედია.

**გახსნა:** ფოლდერი ლოკალურ სერვერზე (`npx serve .`) → `Webu.dc.html`.
