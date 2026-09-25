import type { Lang } from '../i18n';
import en from './en';
import ka, { type Dict } from './ka';
import ru from './ru';

const DICTS: Record<Lang, Dict> = { ka, en, ru };

export const getDict = (lang: Lang): Dict => DICTS[lang];
export type { Dict };
