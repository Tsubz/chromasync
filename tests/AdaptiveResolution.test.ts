import { describe, expect, it } from 'vitest';
import { AdaptiveResolution } from '../src/graphics/AdaptiveResolution';

/** Feeds `seconds` of frames at a fixed interval; returns the time reached. */
function run(ar: AdaptiveResolution, intervalMs: number, seconds: number, start = 0): number {
  let t = start;
  const frames = Math.round((seconds * 1000) / intervalMs);
  for (let i = 0; i < frames; i++) {
    t += intervalMs;
    ar.sample(intervalMs, t);
  }
  return t;
}

describe('AdaptiveResolution', () => {
  it('keeps full resolution when frames keep up with the display', () => {
    const ar = new AdaptiveResolution();
    run(ar, 16.7, 10);
    expect(ar.scale).toBe(1);
  });

  it('lowers the resolution when frames are dropped, down to the floor', () => {
    const ar = new AdaptiveResolution();
    let t = run(ar, 16.7, 1);       // learn the 60 Hz baseline
    t = run(ar, 33.4, 2, t);        // now rendering at 30 fps
    expect(ar.scale).toBeLessThan(1);
    run(ar, 33.4, 30, t);
    expect(ar.scale).toBe(0.5);
  });

  it('raises the resolution again when there is headroom', () => {
    const ar = new AdaptiveResolution();
    let t = run(ar, 16.7, 1);
    t = run(ar, 33.4, 4, t);
    const lowered = ar.scale;
    run(ar, 16.7, 20, t);
    expect(ar.scale).toBeGreaterThan(lowered);
  });

  it('reacts to very slow devices (several hundred ms per frame)', () => {
    const ar = new AdaptiveResolution();
    run(ar, 300, 20);
    expect(ar.scale).toBe(0.5);
  });

  it('ignores long gaps such as a tab switch', () => {
    const ar = new AdaptiveResolution();
    const t = run(ar, 16.7, 1);
    expect(ar.sample(2000, t + 2000)).toBe(false);
    expect(ar.scale).toBe(1);
  });

  it('accepts 60 fps on 120 Hz screens but reacts to real slowdowns', () => {
    const ar = new AdaptiveResolution();
    let t = run(ar, 8.3, 1);
    t = run(ar, 16.7, 8, t);         // throttled to 60 fps (e.g. low-power mode): fine
    expect(ar.scale).toBe(1);
    run(ar, 33.4, 3, t);             // 30 fps: too slow
    expect(ar.scale).toBeLessThan(1);
  });
});
