/**
 * ProceduralReverb: 0 kB Algorithmic Acoustic Reverb
 * Synthesizes a natural, silky room impulse response (IR) inside AudioContext
 * using exponential decay, Rayleigh high-frequency air damping, and stereo decorrelation.
 */
export class ProceduralReverb {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;

  constructor(ctx: AudioContext, destination: AudioNode, wetLevel: number = 0.35) {
    this.ctx = ctx;

    this.input = this.ctx.createGain();
    this.output = this.ctx.createGain();
    this.convolver = this.ctx.createConvolver();
    this.wetGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();

    this.wetGain.gain.setValueAtTime(wetLevel, this.ctx.currentTime);
    this.dryGain.gain.setValueAtTime(1.0 - wetLevel * 0.5, this.ctx.currentTime);

    // Generate procedural impulse response
    this.convolver.buffer = this.generateImpulseResponse(2.5, 2.8);

    // Signal routing
    this.input.connect(this.dryGain);
    this.input.connect(this.convolver);
    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.output);
    this.wetGain.connect(this.output);
    this.output.connect(destination);
  }

  /**
   * Generates a stereo impulse response with Rayleigh air absorption simulation.
   * @param duration Duration of the reverberation tail in seconds (~2.5s)
   * @param decayRate Steepness of the exponential energy decay
   */
  private generateImpulseResponse(duration: number, decayRate: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    const leftData = buffer.getChannelData(0);
    const rightData = buffer.getChannelData(1);

    // Initial early reflection delay offsets
    const earlyDelayL = Math.floor(sampleRate * 0.012);
    const earlyDelayR = Math.floor(sampleRate * 0.019);

    let filterL = 0;
    let filterR = 0;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Exponential energy decay: e^(-decayRate * t)
      const envelope = Math.exp(-decayRate * t);

      // Rayleigh air absorption damping factor: alpha decreases with time,
      // smoothing high frequencies so they decay faster than low frequencies
      const alpha = Math.max(0.08, 0.92 - (t / duration) * 0.75);

      // Independent Gaussian noise generation for Left and Right channels
      const rawNoiseL = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) * 0.5;
      const rawNoiseR = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) * 0.5;

      // Lowpass smoothing filter modeling air absorption
      filterL += alpha * (rawNoiseL - filterL);
      filterR += alpha * (rawNoiseR - filterR);

      // Inject asymmetric early reflection bursts in the first 80ms
      let earlyReflectionL = 0;
      let earlyReflectionR = 0;
      if (i > earlyDelayL && i < earlyDelayL + 800) {
        earlyReflectionL = Math.sin(i * 0.04) * 0.4;
      }
      if (i > earlyDelayR && i < earlyDelayR + 900) {
        earlyReflectionR = Math.cos(i * 0.035) * 0.4;
      }

      leftData[i] = (filterL + earlyReflectionL) * envelope;
      rightData[i] = (filterR + earlyReflectionR) * envelope;
    }

    return buffer;
  }

  public setWetLevel(level: number): void {
    const clamped = Math.max(0.0, Math.min(1.0, level));
    const now = this.ctx.currentTime;
    this.wetGain.gain.setTargetAtTime(clamped, now, 0.05);
    this.dryGain.gain.setTargetAtTime(1.0 - clamped * 0.4, now, 0.05);
  }
}
