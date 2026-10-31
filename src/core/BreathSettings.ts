import { Preferences } from './Preferences';

/** Resonance frequencies vary between people, typically 4.5–7 breaths per minute (Lehrer & Gevirtz, 2014). */
export const RESONANCE_BPM_MIN = 4.5;
export const RESONANCE_BPM_MAX = 7;
export const RESONANCE_BPM_DEFAULT = 5.5;

type Listener = () => void;

/**
 * User adjustments to the breathing patterns. Pattern phase durations read these values
 * on every frame, so a change applies from the current breath onwards.
 */
class BreathSettingsStore {
  private bpm: number;
  private gentle: boolean;
  private listeners = new Set<Listener>();

  constructor() {
    const savedBpm = Preferences.get('resonanceBpm');
    this.bpm = typeof savedBpm === 'number' ? clampBpm(savedBpm) : RESONANCE_BPM_DEFAULT;
    this.gentle = Preferences.get('gentleHolds') === true;
  }

  /** Breaths per minute used by the resonance pattern. */
  get resonanceBpm(): number {
    return this.bpm;
  }

  set resonanceBpm(value: number) {
    this.bpm = clampBpm(value);
    Preferences.set('resonanceBpm', this.bpm);
    this.notify();
  }

  /** Seconds for each half of a resonance breath (equal inhale and exhale). */
  get resonanceHalfCycle(): number {
    return 30 / this.bpm;
  }

  /** Halves breath holds, for beginners or anyone who finds long holds uncomfortable. */
  get gentleHolds(): boolean {
    return this.gentle;
  }

  set gentleHolds(value: boolean) {
    this.gentle = value;
    Preferences.set('gentleHolds', value);
    this.notify();
  }

  public onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

function clampBpm(value: number): number {
  const stepped = Math.round(value * 2) / 2;
  return Math.min(RESONANCE_BPM_MAX, Math.max(RESONANCE_BPM_MIN, stepped));
}

export const BreathSettings = new BreathSettingsStore();
