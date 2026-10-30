import { en, MessageKey } from './en';
import { fr } from './fr';
import { Preferences } from '../core/Preferences';

export type Locale = 'en' | 'fr';
export type { MessageKey };

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { en, fr };

export function detectLocale(): Locale {
  const saved = Preferences.get('locale');
  if (saved === 'en' || saved === 'fr') return saved;
  const languages = typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : [];
  return languages.some(lang => lang?.toLowerCase().startsWith('fr')) ? 'fr' : 'en';
}

let currentLocale: Locale = detectLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  Preferences.set('locale', locale);
}

/** Translates a key, replacing `{name}` placeholders with the given params. */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = DICTIONARIES[currentLocale][key] ?? en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

/** For keys built at runtime from data ids (patterns, atmospheres). */
export function tDynamic(key: string, params?: Record<string, string | number>): string {
  return t(key as MessageKey, params);
}

/**
 * Applies translations to static markup:
 * `data-i18n` sets textContent, `data-i18n-title` / `data-i18n-aria-label` set attributes.
 * Params can be passed as `data-i18n-params='{"mins":3}'`.
 */
export function applyStaticTranslations(root: ParentNode = document): void {
  if (typeof document !== 'undefined') document.documentElement.lang = currentLocale;

  root.querySelectorAll<HTMLElement>('[data-i18n], [data-i18n-title], [data-i18n-aria-label]').forEach(el => {
    let params: Record<string, string | number> | undefined;
    if (el.dataset.i18nParams) {
      try { params = JSON.parse(el.dataset.i18nParams); } catch { params = undefined; }
    }
    if (el.dataset.i18n) el.textContent = tDynamic(el.dataset.i18n, params);
    if (el.dataset.i18nTitle) el.title = tDynamic(el.dataset.i18nTitle, params);
    if (el.dataset.i18nAriaLabel) el.setAttribute('aria-label', tDynamic(el.dataset.i18nAriaLabel, params));
  });
}
