import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { fr } from '../src/i18n/fr';
import { t, setLocale } from '../src/i18n';
import { BREATHING_PATTERNS } from '../src/core/Patterns';
import { ATMOSPHERES } from '../src/core/Atmospheres';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

describe('i18n', () => {
  it('French uses the same placeholders as English', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(fr[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('has no empty translations', () => {
    for (const [key, value] of [...Object.entries(en), ...Object.entries(fr)]) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it.each(['en', 'fr'] as const)('every pattern and atmosphere text resolves in %s', locale => {
    setLocale(locale);
    for (const pattern of BREATHING_PATTERNS) {
      const texts = [pattern.name, pattern.shortName, pattern.tagline, pattern.description,
        ...pattern.phases.flatMap(p => [p.label, p.subtext])];
      for (const text of texts) expect(text).not.toMatch(/^pattern\./);
    }
    for (const atm of ATMOSPHERES) {
      const texts = [atm.name, atm.shortName, atm.tagline, atm.description, atm.binauralLabel, atm.scientificTarget];
      for (const text of texts) expect(text).not.toMatch(/^atm\./);
    }
  });

  it('fills placeholders', () => {
    setLocale('en');
    expect(t('a11y.tuningSet', { hz: 432 })).toBe('Tuning set to 432 Hz');
  });
});
