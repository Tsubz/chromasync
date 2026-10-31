import { describe, expect, it, vi } from 'vitest';
import { SessionTimer } from '../src/core/SessionTimer';

function run(timer: SessionTimer, seconds: number, isPlaying = true): void {
  let ts = 1000;
  timer.update(ts, isPlaying);
  for (let i = 0; i < seconds * 10; i++) {
    ts += 100;
    timer.update(ts, isPlaying);
  }
}

describe('SessionTimer', () => {
  it('is inactive with an unlimited duration', () => {
    const timer = new SessionTimer(0);
    run(timer, 30);
    expect(timer.getState().isActive).toBe(false);
  });

  it('waits for the end of the breath cycle before completing', () => {
    const timer = new SessionTimer(3);
    const onComplete = vi.fn();
    timer.onComplete(onComplete);

    run(timer, 181);
    expect(timer.getState().isFinishingCycle).toBe(true);
    expect(timer.checkCycleCompletion(false)).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();

    expect(timer.checkCycleCompletion(true)).toBe(true);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(timer.getState().isComplete).toBe(true);
  });

  it('does not count time while paused', () => {
    const timer = new SessionTimer(3);
    run(timer, 60, false);
    expect(timer.getState().elapsedSeconds).toBe(0);
  });

  it('can run again after reset', () => {
    const timer = new SessionTimer(3);
    run(timer, 181);
    timer.checkCycleCompletion(true);
    timer.reset();
    expect(timer.getState()).toMatchObject({ isComplete: false, isActive: true, elapsedSeconds: 0 });
  });
});
