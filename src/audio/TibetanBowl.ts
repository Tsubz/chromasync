export class TibetanBowlSynthesizer {
  private ctx: AudioContext;
  private destination: AudioNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
  }

  public strike(baseFrequency: number = 184.0): void {
    const now = this.ctx.currentTime;
    const duration = 7.0; // Long singing resonance

    // Inharmonic partial ratios characteristic of authentic hammered bronze bowls
    const partials = [
      { ratio: 1.0, gain: 0.35, decay: 6.5 },
      { ratio: 1.008, gain: 0.30, decay: 6.0 }, // Beating fundamental
      { ratio: 2.76, gain: 0.22, decay: 4.8 },
      { ratio: 2.775, gain: 0.18, decay: 4.5 }, // Beating overtone
      { ratio: 5.40, gain: 0.12, decay: 3.2 },
      { ratio: 8.93, gain: 0.06, decay: 2.0 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFrequency * p.ratio, now);

      // Fast strike attack & slow exponential ring decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(p.gain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00005, now + p.decay);

      osc.connect(gain);
      gain.connect(this.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }
}
