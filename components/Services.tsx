import type { CSSProperties, ReactNode } from 'react';
import { Arrow } from './ui';
import Serp from './Serp';

const D = 6, U = 8;
const mono: CSSProperties = { fontFamily: 'var(--mono)' };

function B({ delay, style, children }: { delay: number; style?: CSSProperties; children?: ReactNode }) {
  return <div style={{ animation: `wbuild ${D}s cubic-bezier(.2,.7,.2,1) ${delay}s infinite both`, ...style }}>{children}</div>;
}
const Bar = ({ w, h, c, delay, style }: { w: string; h: number; c: string; delay: number; style?: CSSProperties }) =>
  <B delay={delay} style={{ width: w, height: h, borderRadius: h / 2, background: c, ...style }} />;

function WebVis() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 'clamp(16px,4%,32px)', bottom: 0, borderRadius: '18px 18px 0 0', background: '#0E0F12', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#2a2b31' }} />)}
        <span style={{ ...mono, marginLeft: 12, padding: '4px 14px', borderRadius: 999, background: '#1b1c21', fontSize: 11, color: '#9A9AA0' }}>webu.ge</span>
      </div>
      <div style={{ flex: 1, padding: '5% 6%', display: 'flex', flexDirection: 'column', gap: '4.5%', position: 'relative' }}>
        <B delay={0.1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#C6F432' }} />
          <span style={{ display: 'flex', gap: 8 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 34, height: 6, borderRadius: 3, background: '#2a2b31' }} />)}</span>
        </B>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: '3%' }}>
          <Bar w="68%" h={16} c="#F2F1EC" delay={0.35} />
          <Bar w="44%" h={16} c="#F2F1EC" delay={0.5} />
          <Bar w="56%" h={6} c="#3a3b42" delay={0.7} style={{ marginTop: 6 }} />
          <Bar w="38%" h={6} c="#3a3b42" delay={0.8} />
        </div>
        <B delay={1.0} style={{ alignSelf: 'flex-start', position: 'relative' }}>
          <div style={{ position: 'relative', padding: '9px 18px', borderRadius: 10, background: '#C6F432', color: '#0E0F12', fontSize: 12, fontWeight: 700, animation: `wpress ${D}s ease 1s infinite both` }}>
            დაიწყე
            <span style={{ position: 'absolute', left: 28, top: 14, width: 22, height: 22, margin: '-11px 0 0 -11px', borderRadius: '50%', border: '2px solid #C6F432', animation: `wring ${D}s ease-out 1s infinite both` }} />
            <span style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 14, borderRadius: '50%', background: '#F2F1EC', border: '3px solid #0E0F12', boxShadow: '0 0 0 1px #F2F1EC', animation: `wcur ${D}s cubic-bezier(.5,0,.2,1) 1s infinite both` }} />
          </div>
        </B>
        <div style={{ display: 'flex', gap: '3%', flex: 1, minHeight: 0 }}>
          {[0, 1, 2].map(i => <B key={i} delay={1.3 + i * 0.15} style={{ flex: 1, borderRadius: 12, background: '#1b1c21', border: '1px solid rgba(255,255,255,0.05)' }} />)}
        </div>
        <div style={{ position: 'absolute', right: '6%', top: '8%', width: 64, height: 64, borderRadius: '50%', background: '#C6F432', color: '#0E0F12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: `wpop ${D}s cubic-bezier(.3,1.6,.5,1) 1s infinite both` }}>
          <span style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>100</span>
          <span style={{ ...mono, fontSize: 9, marginTop: 2 }}>სიჩქარე</span>
        </div>
      </div>
    </div>
  );
}

function UiVis() {
  const cr = (pos: CSSProperties, k: string) => <span key={k} style={{ position: 'absolute', width: 7, height: 7, background: '#F2F1EC', border: '1.5px solid #C6F432', ...pos }} />;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
      <div style={{ position: 'absolute', left: '20%', top: '12%', width: '44%', height: '76%', borderRadius: 14, background: '#1b1c21', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', left: '6%', top: '5%', width: '88%', height: '45%', borderRadius: 10, animation: `uimg ${U}s ease infinite`, background: '#2a2b31' }} />
        <div style={{ position: 'absolute', left: '6%', top: '56%', width: '70%', height: 10, borderRadius: 5, background: '#F2F1EC' }} />
        <div style={{ position: 'absolute', left: '6%', top: '64%', width: '48%', height: 6, borderRadius: 3, background: '#3a3b42' }} />
        <div style={{ position: 'absolute', left: '6%', bottom: '7%', width: '50%', height: '14%', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: '#C6F432', color: '#0E0F12', animation: `ubtn ${U}s ease infinite` }}>ღილაკი</div>
      </div>
      <div style={{ position: 'absolute', left: '19%', top: '10.5%', width: '46%', height: '79%', border: '1.5px solid #C6F432', animation: `usel ${U}s cubic-bezier(.7,0,.2,1) infinite`, pointerEvents: 'none' }}>
        {cr({ left: -4, top: -4 }, 'a')}{cr({ right: -4, top: -4 }, 'b')}{cr({ left: -4, bottom: -4 }, 'c')}{cr({ right: -4, bottom: -4 }, 'd')}
      </div>
      <div style={{ position: 'absolute', left: '70%', top: '18%', width: '22%', minWidth: 96, padding: 10, borderRadius: 12, background: '#0E0F12', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ ...mono, fontSize: 10, color: '#9A9AA0', marginBottom: 8 }}>ფერი</div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ position: 'absolute', left: -4, top: -4, right: -4, height: 44, borderRadius: 8, border: '1.5px solid #C6F432', animation: `uswatch ${U}s cubic-bezier(.7,0,.2,1) infinite` }} />
          {[['#C6F432', 'ლაიმი'], ['#8B6CFF', 'იისფერი'], ['#0E0F12', 'მუქი']].map(([c, n]) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36 }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: c, border: '1px solid rgba(255,255,255,0.15)', flex: 'none' }} />
              <span style={{ fontSize: 11, color: '#D6D6DA' }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Num = ({ n, lime = true, mb = 10 }: { n: string; lime?: boolean; mb?: number }) =>
  <div style={{ ...mono, fontSize: 12, color: lime ? '#C6F432' : undefined, marginBottom: mb }}>{n}</div>;

export default function Services() {
  return (
    <section id="services" className="sec">
      <div className="inner">
        <div className="head-row">
          <div style={{ flex: '1 1 560px' }}>
            <h2 className="h2" style={{ maxWidth: 900 }}>ყველაფერი, რაც შენს ბიზნესს ინტერნეტში სჭირდება</h2>
          </div>
          <p style={{ margin: 0, flex: '0 1 min(340px,100%)', minWidth: 0, color: '#9A9AA0', lineHeight: 1.6 }}>ერთი კონტაქტი, ერთი გუნდი, ერთი პასუხისმგებლობა. აღარ გჭირდება ხუთ სხვადასხვა კომპანიასთან ურთიერთობა.</p>
        </div>
        <div className="grid">
          <article className="card r32" style={{ flex: '1 1 min(620px,100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#131418', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}><WebVis /></div>
            <div style={{ padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <Num n="01" />
                <h3 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 800 }}>ვებსაიტები</h3>
                <p style={{ margin: 0, color: '#B9B9BE', lineHeight: 1.6 }}>ლენდინგები, კორპორატიული საიტები და ონლაინ მაღაზიები, რომლებიც სწრაფად იტვირთება და ყიდის.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Next.js', 'Webflow', 'Shopify'].map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          </article>

          <article className="r32" style={{ flex: '1 1 min(400px,100%)', minWidth: 0, minHeight: 480, background: '#C6F432', color: '#0E0F12', padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Num n="02" lime={false} mb={0} />
              <div style={{ display: 'flex' }} aria-hidden="true">
                <span style={{ width: 56, height: 56, borderRadius: '50%', background: '#0E0F12', display: 'block' }} />
                <span style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #0E0F12', display: 'block', marginLeft: -16 }} />
              </div>
            </div>
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 800 }}>მობილური აპლიკაციები</h3>
              <p style={{ margin: '0 0 24px', lineHeight: 1.6, maxWidth: 380 }}>iOS და Android აპები ერთი კოდით ან ნატიურად. დიზაინიდან App Store ში განთავსებამდე.</p>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(14,15,18,0.2)' }}>
                {['React Native', 'Flutter', 'Swift და Kotlin'].map(t => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(14,15,18,0.2)', fontWeight: 500 }}>
                    <span>{t}</span>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#0E0F12', color: '#C6F432', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Arrow rot={-45} /></span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="r32" style={{ flex: '1 1 min(440px,100%)', minWidth: 0, background: '#F2F1EC', color: '#0E0F12', padding: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 999, background: '#fff', border: '1px solid rgba(14,15,18,0.1)', fontSize: 15 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #0E0F12', flex: 'none' }} />
              <span>ვებსაიტის დამზადება თბილისში</span>
            </div>
            <Serp />
            <div>
              <Num n="03" lime={false} mb={8} />
              <h3 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 800 }}>SEO ოპტიმიზაცია</h3>
              <p style={{ margin: 0, lineHeight: 1.6, color: '#44454b' }}>ტექნიკური აუდიტი, კონტენტის სტრატეგია და ბმულები. ამოდი ხმაურიდან და იყავი პირველი.</p>
            </div>
          </article>

          <article className="card r32" style={{ flex: '1 1 min(580px,100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 320, overflow: 'hidden', background: '#131418', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}><UiVis /></div>
            <div style={{ padding: 28 }}>
              <Num n="04" />
              <h3 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800 }}>UI და UX დიზაინი</h3>
              <p style={{ margin: 0, maxWidth: 460, color: '#B9B9BE', lineHeight: 1.6 }}>ინტერფეისები, რომლებსაც ხალხი ეხება, არა უბრალოდ უყურებს. მიკროანიმაციები, დიზაინ სისტემები, პროტოტიპები.</p>
            </div>
          </article>

          {[
            ['05', 'ონლაინ მაღაზია', 'გადახდები ქართულ ბანკებთან, მარაგის მართვა, მიწოდება.'],
            ['06', 'ბრენდინგი', 'ლოგო, ფერები, შრიფტები და ვიზუალური ენა, რომელიც გამოგარჩევს.'],
            ['07', 'ჰოსტინგი და მხარდაჭერა', 'სერვერები, უსაფრთხოება, განახლებები. შენ ბიზნესს მართავ, ჩვენ საიტს.'],
          ].map(([n, t, d]) => (
            <article key={n} className="card r32 svc-small">
              <Num n={n} mb={0} />
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>{t}</h3>
                <p style={{ margin: 0, color: '#9A9AA0', lineHeight: 1.6 }}>{d}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
