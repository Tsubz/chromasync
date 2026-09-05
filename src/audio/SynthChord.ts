export type TuningFrequency = 432 | 440 | 528;

export interface ChordVoice {
  oscLeft: OscillatorNode;
  oscRight: OscillatorNode;
  gain: GainNode;
  pannerLeft: StereoPannerNode | null;
  pannerRight: StereoPannerNode | null;
}

export class SynthChord {
  private ctx: AudioContext;
  private masterOutput: GainNode;
  private filter: BiquadFilterNode;
  private voices: ChordVoice[] = [];
  
  private currentTuning: TuningFrequency = 432;
  private currentBinauralBeat: number = 5.5; // in Hz
  // Base intervals relative to reference A (Major 9th / Sus2 ethereal chord)
  private intervalRatios = [0.25, 0.375, 0.5, 0.5625, 0.625];

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.masterOutput = this.ctx.createGain();
    this.masterOutput.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.filter.connect(this.masterOutput);
    this.masterOutput.connect(destination);

    this.initVoices();
  }

  private initVoices(): void {
    const types: OscillatorType[] = ['sine', 'triangle', 'sine', 'triangle', 'sine'];

    this.intervalRatios.forEach((ratio, idx) => {
      const baseFreq = this.currentTuning * ratio;

      const oscLeft = this.ctx.createOscillator();
      const oscRight = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const pannerLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const pannerRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      oscLeft.type = types[idx % types.length];
      oscRight.type = types[idx % types.length];

      // Binaural Theta/Alpha difference between left and right ear
      oscLeft.frequency.setValueAtTime(baseFreq - this.currentBinauralBeat / 2, this.ctx.currentTime);
      oscRight.frequency.setValueAtTime(baseFreq + this.currentBinauralBeat / 2, this.ctx.currentTime);

      const voiceGain = idx === 0 ? 0.35 : idx === 1 ? 0.28 : 0.18;
      gain.gain.setValueAtTime(voiceGain, this.ctx.currentTime);

      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-0.65, this.ctx.currentTime);
        pannerRight.pan.setValueAtTime(0.65, this.ctx.currentTime);

        oscLeft.connect(pannerLeft);
        pannerLeft.connect(gain);

        oscRight.connect(pannerRight);
        pannerRight.connect(gain);
      } else {
        oscLeft.connect(gain);
        oscRight.connect(gain);
      }

      gain.connect(this.filter);

      oscLeft.start();
      oscRight.start();

      this.voices.push({
        oscLeft,
        oscRight,
        gain,
        pannerLeft,
        pannerRight
      });
    });
  }

  public setTuningAndBeat(tuning: TuningFrequency, binauralBeat?: number): void {
    this.currentTuning = tuning;
    if (binauralBeat !== undefined) {
      this.currentBinauralBeat = binauralBeat;
    }
    const now = this.ctx.currentTime;

    this.voices.forEach((voice, idx) => {
      const baseFreq = this.currentTuning * this.intervalRatios[idx];
      voice.oscLeft.frequency.setTargetAtTime(baseFreq - this.currentBinauralBeat / 2, now, 0.4);
      voice.oscRight.frequency.setTargetAtTime(baseFreq + this.currentBinauralBeat / 2, now, 0.4);
    });
  }

  public setTuning(tuning: TuningFrequency): void {
    this.setTuningAndBeat(tuning, this.currentBinauralBeat);
  }

  public getTuning(): TuningFrequency {
    return this.currentTuning;
  }

  public getBinauralBeat(): number {
    return this.currentBinauralBeat;
  }

  public update(breathScale: number, isPlaying: boolean): void {
    const now = this.ctx.currentTime;
    if (!isPlaying) {
      this.masterOutput.gain.setTargetAtTime(0.0, now, 0.4);
      return;
    }

    // Rebalanced gain: 0.38 (gentle, warm bed that lets nature sounds take center stage)
    this.masterOutput.gain.setTargetAtTime(0.38, now, 0.3);

    // Vasomotor pulse: living cardiovascular circulation ripple (0.12 Hz Mayer wave)
    const vasomotorPulse = 22 * Math.sin(now * 0.75);
    const targetCutoff = 180 + 1300 * Math.pow(breathScale, 1.4) + vasomotorPulse;
    this.filter.frequency.setTargetAtTime(targetCutoff, now, 0.1);

    // 3D Spatial Audio: Expand stereophonic width on inhale, gather inward on exhale
    const panSpread = 0.50 + 0.42 * breathScale;
    // Brownian Analog Pitch Drift: Golden-ratio phase offsets preventing digital rigidity
    const driftPhase = now * 0.07;

    this.voices.forEach((voice, idx) => {
      if (voice.pannerLeft && voice.pannerRight) {
        voice.pannerLeft.pan.setTargetAtTime(-panSpread, now, 0.2);
        voice.pannerRight.pan.setTargetAtTime(panSpread, now, 0.2);
      }

      const baseFreq = this.currentTuning * this.intervalRatios[idx];
      const drift = 0.12 * Math.sin(driftPhase + idx * 1.618);
      voice.oscLeft.frequency.setTargetAtTime(baseFreq - this.currentBinauralBeat / 2 + drift, now, 0.2);
      voice.oscRight.frequency.setTargetAtTime(baseFreq + this.currentBinauralBeat / 2 - drift, now, 0.2);
    });
  }

  public stop(): void {
    this.masterOutput.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
  }
}
