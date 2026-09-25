import { JetBrains_Mono, Noto_Sans, Noto_Sans_Georgian, Unbounded } from 'next/font/google';

// Noto Sans Georgian has no Cyrillic, so Noto Sans follows it in the --geo stack
// and fills in Russian text glyph by glyph.
export const geo = Noto_Sans_Georgian({ subsets: ['georgian', 'latin'], weight: ['400', '500', '600', '700', '800', '900'], display: 'swap', variable: '--font-geo' });
export const cyr = Noto_Sans({ subsets: ['cyrillic'], weight: ['400', '500', '600', '700', '800', '900'], display: 'swap', preload: false, variable: '--font-cyr' });
export const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], weight: ['400', '500'], display: 'swap', variable: '--font-mono' });
export const unb = Unbounded({ subsets: ['latin'], weight: '800', display: 'swap', preload: false, variable: '--font-unb' });

export const fontClasses = `${geo.variable} ${cyr.variable} ${mono.variable} ${unb.variable}`;
