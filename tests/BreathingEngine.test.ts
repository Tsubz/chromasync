import { describe, expect, it } from 'vitest';
import { BreathingEngine } from '../src/core/BreathingEngine';
import { BREATHING_PATTERNS } from '../src/core/Patterns';

/** Advances the engine in 100 ms frames, like requestAnimationFrame would. */
function advance(engine: BreathingEngine, seconds: number, start = 1000): number {
  let ts = start;
  engine.update(ts);
  const frames = Math.round(seconds * 10);
  for (let i = 0; i < frames; i++) {
    ts += 100;
    engine.update(ts);
  }
  return ts;
}

describe('BreathingEngine', () => {
  it('starts paused', () => {
    expect(new BreathingEngine('coherence_55').getState().isPlaying).toBe(false);
  });

  it('moves through the phases of the pattern', () => {
    const engine = new BreathingEngine('box_4444');
    engine.start();
    advance(engine, 4.05);
    expect(engine.getState().currentPhase.type).toBe('hold_in');
    expect(engine.getState().breathScale).toBeGreaterThan(0.95);
  });

  it('flags a completed cycle only when wrapping back to the first phase', () => {
    const engine = new BreathingEngine('coherence_55');
    const flags: boolean[] = [];
    engine.onPhaseTransition((_from, _to, isCycleComplete) => flags.push(isCycleComplete));
    engine.start();
    advance(engine, 11.05);
    expect(flags).toEqual([false, true]);
  });

  it('does not report a completed cycle when the pattern changes', () => {
    const engine = new BreathingEngine('coherence_55');
    const flags: boolean[] = [];
    engine.onPhaseTransition((_from, _to, isCycleComplete) => flags.push(isCycleComplete));
    engine.setPattern('box_4444');
    expect(flags).toEqual([false]);
  });

  it('ignores time while paused', () => {
    const engine = new BreathingEngine('coherence_55');
    advance(engine, 20);
    expect(engine.getState().phaseIndex).toBe(0);
    expect(engine.getState().breathScale).toBe(0);
  });

  it('raises the breath while the finger is held in free flow', () => {
    const engine = new BreathingEngine('free_flow');
    engine.setTouchPacing(true);
    advance(engine, 2);
    const state = engine.getState();
    expect(state.isTouchPacing).toBe(true);
    expect(state.currentPhase.type).toBe('inhale');
    expect(state.breathScale).toBeGreaterThan(0.3);
  });
});

describe('BREATHING_PATTERNS', () => {
  it('has unique ids and positive durations', () => {
    const ids = BREATHING_PATTERNS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const pattern of BREATHING_PATTERNS) {
      for (const phase of pattern.phases) expect(phase.duration).toBeGreaterThan(0);
    }
  });

  it('models the physiological sigh top-up as an inhale', () => {
    const sigh = BREATHING_PATTERNS.find(p => p.id === 'sigh_huberman')!;
    expect(sigh.phases.map(p => p.type)).toEqual(['inhale', 'inhale', 'exhale']);
  });
});
