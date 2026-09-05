import { SynthChord, TuningFrequency } from './SynthChord';
import { SoundEffects } from './SoundEffects';
import { TibetanBowlSynthesizer } from './TibetanBowl';
import { AtmosphereSoundManager } from './AtmosphereSounds';
import { ProceduralReverb } from './ProceduralReverb';
import { Atmosphere, AtmosphereId } from '../core/Atmospheres';
import { BreathPhaseType } from '../core/Patterns';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverb: ProceduralReverb | null = null;
  private synthChord: SynthChord | null = null;
  private soundEffects: SoundEffects | null = null;
  private tibetanBowl: TibetanBowlSynthesizer | null = null;
  private atmosphereSounds: AtmosphereSoundManager | null = null;
  
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;
  private volume: number = 0.8;
  private currentTuning: TuningFrequency = 432;
  private currentAtmosphereId: AtmosphereId = 'aurora';

  constructor() {}

  public unlock(): void {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Algorithmic 0 kB Acoustic Reverb
      this.reverb = new ProceduralReverb(this.ctx, this.masterGain, 0.32);

      // Sub-modules routing through reverb space
      this.synthChord = new SynthChord(this.ctx, this.reverb.input);
      this.synthChord.setTuning(this.currentTuning);
      this.soundEffects = new SoundEffects(this.ctx, this.masterGain);
      this.tibetanBowl = new TibetanBowlSynthesizer(this.ctx, this.reverb.input);
      this.atmosphereSounds = new AtmosphereSoundManager(this.ctx, this.masterGain, this.reverb.input);
      this.atmosphereSounds.setAtmosphere(this.currentAtmosphereId);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isUnlocked = true;
  }

  public update(breathScale: number, isPlaying: boolean): void {
    if (!this.isUnlocked || !this.synthChord || !this.soundEffects) return;
    this.synthChord.update(breathScale, isPlaying && !this.isMuted);
    this.soundEffects.updateBreathNoise(breathScale, isPlaying && !this.isMuted);
    if (this.atmosphereSounds) {
      this.atmosphereSounds.update(breathScale, isPlaying && !this.isMuted);
    }
  }

  public setAtmosphere(atmosphere: Atmosphere): void {
    this.currentAtmosphereId = atmosphere.id;
    this.currentTuning = atmosphere.recommendedTuning;

    if (this.atmosphereSounds) {
      this.atmosphereSounds.setAtmosphere(atmosphere.id);
    }
    if (this.synthChord) {
      this.synthChord.setTuningAndBeat(atmosphere.recommendedTuning, atmosphere.recommendedBinauralBeat);
    }
  }

  public triggerPhaseCue(phaseType: BreathPhaseType): void {
    if (!this.isUnlocked || !this.soundEffects || this.isMuted) return;
    this.soundEffects.playPhaseCue(phaseType);
  }

  public strikeTibetanBowl(): void {
    if (!this.isUnlocked || !this.tibetanBowl || this.isMuted) return;
    this.tibetanBowl.strike(this.currentTuning * 0.425);
  }

  public setTuningAndBeat(tuning: TuningFrequency, beat: number): void {
    this.currentTuning = tuning;
    if (this.synthChord) {
      this.synthChord.setTuningAndBeat(tuning, beat);
    }
  }

  public setTuning(tuning: TuningFrequency): void {
    this.currentTuning = tuning;
    if (this.synthChord) {
      this.synthChord.setTuning(tuning);
    }
  }

  public cycleNextTuning(): TuningFrequency {
    const tunings: TuningFrequency[] = [432, 440, 528];
    const currentIdx = tunings.indexOf(this.currentTuning);
    const nextTuning = tunings[(currentIdx + 1) % tunings.length];
    this.setTuning(nextTuning);
    return nextTuning;
  }

  public getTuning(): TuningFrequency {
    return this.currentTuning;
  }

  public getCurrentAtmosphereId(): string {
    return this.currentAtmosphereId;
  }

  public getBinauralBeat(): number {
    return this.synthChord ? this.synthChord.getBinauralBeat() : 5.5;
  }

  public toggleMute(): boolean {
    this.unlock();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0.0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}
