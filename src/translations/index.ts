import { en } from './en';
import { ml } from './ml';

export type Language = 'en' | 'ml';
export type TranslationKey = keyof typeof en;

export const translations: Record<Language, typeof en> = {
  en,
  ml: ml as unknown as typeof en
};
