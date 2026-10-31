import { afterEach, describe, expect, it } from 'vitest';
import { BreathSettings, RESONANCE_BPM_DEFAULT } from '../src/core/BreathSettings';
import { BREATHING_PATTERNS } from '../src/core/Patterns';
import { setLocale } from '../src/i18n';

const pattern = (id: string) => BREATHING_PATTERNS.find(p => p.id === id)!;
const durations = (id: string) => pattern(id).phases.map(p => p.duration);

describe('BreathSettings', () => {
  afterEach(() => {
    BreathSettings.resonanceBpm = RESONANCE_BPM_DEFAULT;
    BreathSettings.gentleHolds = false;
  });

  it('paces resonance breathing at 5.5 breaths per minute by default', () => {
    const [inhale, exhale] = durations('coherence_55');
    expect(inhale).toBeCloseTo(30 / 5.5);
    expect(60 / (inhale + exhale)).toBeCloseTo(5.5);
  });

  it('follows the chosen pace, clamped to 4.5–7 in half steps', () => {
    BreathSettings.resonanceBpm = 6;
    expect(durations('coherence_55')).toEqual([5, 5]);
    BreathSettings.resonanceBpm = 9;
    expect(BreathSettings.resonanceBpm).toBe(7);
    BreathSettings.resonanceBpm = 4.8;
    expect(BreathSettings.resonanceBpm).toBe(5);
  });

  it('shows the pace in the pattern name', () => {
    setLocale('en');
    BreathSettings.resonanceBpm = 6;
    expect(pattern('coherence_55').shortName).toBe('5s Coherence');
  });

  it('halves holds only when gentle holds are on', () => {
    expect(durations('relax_478')).toEqual([4, 7, 8]);
    BreathSettings.gentleHolds = true;
    expect(durations('relax_478')).toEqual([4, 3.5, 8]);
    expect(durations('box_4444')).toEqual([4, 2, 4, 2]);
    expect(durations('sigh_huberman')).toEqual([3, 1.2, 6]);
  });

  it('notifies listeners on change', () => {
    let calls = 0;
    const off = BreathSettings.onChange(() => calls++);
    BreathSettings.resonanceBpm = 6.5;
    BreathSettings.gentleHolds = true;
    off();
    expect(calls).toBe(2);
  });
});
