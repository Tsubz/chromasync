import { Preferences } from './Preferences';
import { TuningFrequency } from '../audio/SynthChord';

export const BINAURAL_BEATS = [4, 5.5, 10] as const;
export type BinauralBeat = typeof BINAURAL_BEATS[number];

type Listener = () => void;

/**
 * Sound preferences, independent of the atmosphere. Binaural beats are off by default:
 * they only work with headphones (on a phone speaker the two tones mix in the air and
 * wobble), and the evidence for their effects is modest.
 */
class SoundSettingsStore {
  private tuningValue: TuningFrequency;
  private binauralOn: boolean;
  private beat: BinauralBeat;
  private listeners = new Set<Listener>();

  constructor() {
    this.tuningValue = Preferences.get('tuning') === 440 ? 440 : 432;
    this.binauralOn = Preferences.get('binauralEnabled') === true;
    const savedBeat = Preferences.get('binauralBeat');
    this.beat = (BINAURAL_BEATS as readonly number[]).includes(savedBeat as number) ? savedBeat as BinauralBeat : 5.5;
  }

  get tuning(): TuningFrequency {
    return this.tuningValue;
  }

  set tuning(value: TuningFrequency) {
    this.tuningValue = value === 440 ? 440 : 432;
    Preferences.set('tuning', this.tuningValue);
    this.notify();
  }

  get binauralEnabled(): boolean {
    return this.binauralOn;
  }

  set binauralEnabled(value: boolean) {
    this.binauralOn = value;
    Preferences.set('binauralEnabled', value);
    this.notify();
  }

  get binauralBeat(): BinauralBeat {
    return this.beat;
  }

  set binauralBeat(value: BinauralBeat) {
    this.beat = value;
    Preferences.set('binauralBeat', value);
    this.notify();
  }

  /** Left/right frequency difference actually played: 0 when binaural beats are off. */
  get effectiveBeat(): number {
    return this.binauralOn ? this.beat : 0;
  }

  public onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const SoundSettings = new SoundSettingsStore();
