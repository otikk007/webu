import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

// Share image in the site's style: dark ground, lime accent, Georgian title.
export async function ogImage(title: string, kicker: string, tagline = 'თქვენი იდეა. ჩვენი გამოცდილება.') {
  const dir = join(process.cwd(), 'assets/fonts');
  const [geo, latin] = await Promise.all([
    readFile(join(dir, 'NotoSansGeorgian-Bold.ttf')),
    readFile(join(dir, 'NotoSans-Bold.ttf')),
  ]);
  const size = title.length > 60 ? 58 : title.length > 40 ? 66 : 76;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#0E0F12', color: '#F2F1EC', fontFamily: 'Geo, Latin' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: '#C6F432' }} />
          <div style={{ width: 20, height: 20, borderRadius: 999, background: '#8B6CFF' }} />
          <div style={{ fontSize: 40, marginLeft: 8, letterSpacing: -1 }}>webu</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 28, color: '#C6F432' }}>{kicker}</div>
          <div style={{ fontSize: size, lineHeight: 1.15, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ fontSize: 26, color: '#9A9AA0' }}>{tagline}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Geo', data: geo, weight: 700 }, { name: 'Latin', data: latin, weight: 700 }] },
  );
}
