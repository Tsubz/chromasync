import { describe, expect, it } from 'vitest';
import { parseDeepLink } from '../src/core/DeepLink';
import { BREATHING_PATTERNS } from '../src/core/Patterns';
import { ATMOSPHERES } from '../src/core/Atmospheres';

const parse = (search: string) =>
  parseDeepLink(search, BREATHING_PATTERNS.map(p => p.id), ATMOSPHERES.map(a => a.id));

describe('parseDeepLink', () => {
  it('reads the links used by the science pages', () => {
    expect(parse('?pattern=box&atm=ocean')).toEqual({ patternId: 'box_4444', atmosphereId: 'ocean' });
    expect(parse('?pattern=relax478&atm=hearth')).toEqual({ patternId: 'relax_478', atmosphereId: 'hearth' });
    expect(parse('?tuning=432')).toEqual({ tuning: 432 });
  });

  it('accepts full pattern ids', () => {
    expect(parse('?pattern=sleep_426').patternId).toBe('sleep_426');
  });

  it('ignores unknown values', () => {
    expect(parse('?pattern=nope&atm=moon&tuning=999')).toEqual({});
  });
});
