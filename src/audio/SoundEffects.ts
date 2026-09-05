import { BreathPhaseType } from '../core/Patterns';

export class SoundEffects {
  private ctx: AudioContext;
  private destination: AudioNode;

  // Pink noise generator for gentle breath breeze
  private noiseGain: GainNode;
  private noiseFilter: BiquadFilterNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;

    // Setup pink noise flow
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.destination);

    this.initNoiseBuffer();
  }

  private initNoiseBuffer(): void {
    const bufferSize = this.ctx.sampleRate * 4; // 4 second loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation algorithm (Paul Kellet's filtered white noise)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.noiseFilter);
    source.start();
  }

  public updateBreathNoise(breathScale: number, isPlaying: boolean): void {
    if (!isPlaying) {
      this.noiseGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.2);
      return;
    }

    // Dynamic wind breath swell
    const targetGain = 0.04 + 0.08 * breathScale;
    const targetFreq = 220 + 350 * breathScale;

    this.noiseGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
    this.noiseFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);
  }

  public playPhaseCue(phaseType: BreathPhaseType): void {
    // Elegant crystal chime bell
    const chimeFreqs: Record<BreathPhaseType, number[]> = {
      'inhale': [523.25, 783.99],   // C5, G5
      'hold_in': [659.25, 1046.50], // E5, C6
      'exhale': [440.00, 659.25],   // A4, E5
      'hold_out': [392.00, 587.33]  // G4, D5
    };

    const freqs = chimeFreqs[phaseType] || [523.25];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const startTime = this.ctx.currentTime + idx * 0.04;
      const duration = 1.6;

      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.09, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }
}
