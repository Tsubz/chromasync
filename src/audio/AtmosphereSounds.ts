import { AtmosphereId } from '../core/Atmospheres';

/**
 * AtmosphereSoundManager: High-Fidelity 0 kB Physical Modeling Synthesis
 * Implements physical acoustic models for Ocean (Minnaert bubbles & groundswell),
 * Rain (Poisson leaf droplet resonances), Hearth (steam venting & wood pops),
 * and Astral (quartz crystal bowl modal harmonics).
 */
export class AtmosphereSoundManager {
  private ctx: AudioContext;
  private destination: AudioNode;
  private reverbSend: AudioNode | null;

  // Master buses for each atmosphere
  private auroraGain: GainNode;
  private oceanGain: GainNode;
  private rainGain: GainNode;
  private hearthGain: GainNode;
  private astralGain: GainNode;

  // Ocean Nodes
  private oceanSwellFilter: BiquadFilterNode;
  private oceanTurbulenceFilter: BiquadFilterNode;
  private oceanBubbleTimer: number | null = null;

  // Rain Nodes
  private rainBedFilter: BiquadFilterNode;
  private rainDropletTimer: number | null = null;

  // Hearth Nodes
  private hearthCrackleTimer: number | null = null;
  private hearthSizzleFilter: BiquadFilterNode;

  // Astral Nodes
  private astralOscs: OscillatorNode[] = [];
  private astralLfo: OscillatorNode | null = null;

  private currentAtmosphere: AtmosphereId = 'aurora';
  private currentBreathScale: number = 0.5;

  constructor(ctx: AudioContext, destination: AudioNode, reverbSend?: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
    this.reverbSend = reverbSend ?? null;

    this.auroraGain = this.createAtmosphereBus();
    this.oceanGain = this.createAtmosphereBus();
    this.rainGain = this.createAtmosphereBus();
    this.hearthGain = this.createAtmosphereBus();
    this.astralGain = this.createAtmosphereBus();

    // Default to aurora
    this.auroraGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Initialize physical sound engines
    const oceanFilters = this.setupOcean();
    this.oceanSwellFilter = oceanFilters.swell;
    this.oceanTurbulenceFilter = oceanFilters.turbulence;

    this.rainBedFilter = this.setupRain();
    this.hearthSizzleFilter = this.setupHearth();
    this.setupAstral();
    this.startMicroPhysicsLoops();
  }

  private createAtmosphereBus(): GainNode {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.connect(this.destination);

    // Send 25% of atmosphere signal to the procedural reverb for spatial depth
    if (this.reverbSend) {
      const sendGain = this.ctx.createGain();
      sendGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.connect(sendGain);
      sendGain.connect(this.reverbSend);
    }

    return gain;
  }

  /**
   * Generates a 4-second stereo Voss-McCartney 1/f Pink Noise buffer.
   */
  private createPinkNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.1538520;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.0168980;
      left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + whiteL * 0.5362) * 0.09;

      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.1538520;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.0168980;
      right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + whiteR * 0.5362) * 0.09;
    }
    return buffer;
  }

  // =========================================================================
  // 1. Oceanic Tide: Groundswell + Wave-breaker Turbulence + Minnaert Bubbles
  // =========================================================================
  private setupOcean(): { swell: BiquadFilterNode; turbulence: BiquadFilterNode } {
    const noiseBuffer = this.createPinkNoiseBuffer();

    // Layer 1: Sub-bass Groundswell (visceral water mass)
    const swellSource = this.ctx.createBufferSource();
    swellSource.buffer = noiseBuffer;
    swellSource.loop = true;

    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(75, this.ctx.currentTime);
    swellFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    swellSource.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(this.oceanGain);
    swellSource.start();

    // Layer 2: Wave-breaker Turbulence (crest wash)
    const turbSource = this.ctx.createBufferSource();
    turbSource.buffer = noiseBuffer;
    turbSource.loop = true;

    const turbFilter = this.ctx.createBiquadFilter();
    turbFilter.type = 'bandpass';
    turbFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    turbFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);

    const turbGain = this.ctx.createGain();
    turbGain.gain.setValueAtTime(0.42, this.ctx.currentTime);

    turbSource.connect(turbFilter);
    turbFilter.connect(turbGain);
    turbGain.connect(this.oceanGain);
    turbSource.start();

    return { swell: swellFilter, turbulence: turbFilter };
  }

  /**
   * Minnaert Bubble Resonance:
   * Simulates micro-bubbles popping and singing in the foam backwash (950Hz - 2200Hz)
   */
  private triggerMinnaertBubble(): void {
    if (this.currentAtmosphere !== 'ocean') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Minnaert frequency formula: smaller bubbles resonate higher
    const radiusMm = 1.2 + Math.random() * 2.2;
    const baseFreq = (3000 / radiusMm) * (0.85 + Math.random() * 0.3);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    // Typical acoustic bubble chirp: pitch rises by ~15% over its brief life as air pressure stabilizes
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.025);

    const volume = 0.015 + Math.random() * 0.025;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    if (panner) {
      panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.8, now);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.oceanGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // =========================================================================
  // 2. Forest Rain: Moisture Bed + Poisson Canopy Leaf Droplet Resonances
  // =========================================================================
  private setupRain(): BiquadFilterNode {
    const noiseBuffer = this.createPinkNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.75, this.ctx.currentTime);

    const rainSubGain = this.ctx.createGain();
    rainSubGain.gain.setValueAtTime(0.38, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(rainSubGain);
    rainSubGain.connect(this.rainGain);
    source.start();

    return filter;
  }

  /**
   * Poisson Droplet Resonances:
   * Models individual drops striking leaves and mossy ground (450Hz - 3400Hz).
   */
  private triggerCanopyDroplet(): void {
    if (this.currentAtmosphere !== 'rain') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // 2 distinct physical droplet types:
    // Type A: Deep hollow leaf plop (500Hz - 900Hz)
    // Type B: Fine crisp needle ping (1800Hz - 3200Hz)
    const isLeafPlop = Math.random() > 0.4;
    const basePitch = isLeafPlop ? (520 + Math.random() * 380) : (1800 + Math.random() * 1400);

    osc.type = isLeafPlop ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * (isLeafPlop ? 1.4 : 1.1), now + 0.03);

    const dropVol = isLeafPlop ? (0.025 + Math.random() * 0.035) : (0.012 + Math.random() * 0.02);
    const duration = isLeafPlop ? 0.055 : 0.035;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(dropVol, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    if (panner) {
      panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.85, now);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.rainGain);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  // =========================================================================
  // 3. Warm Hearth: Thermal Convection + Steam Pocket Sizzle + Wood Pops
  // =========================================================================
  private setupHearth(): BiquadFilterNode {
    const noiseBuffer = this.createPinkNoiseBuffer();

    // Layer 1: Thermal low convective rumble
    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = noiseBuffer;
    rumbleSource.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(110, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.hearthGain);
    rumbleSource.start();

    // Layer 2: Steam pocket sizzle
    const sizzleSource = this.ctx.createBufferSource();
    sizzleSource.buffer = noiseBuffer;
    sizzleSource.loop = true;

    const sizzleFilter = this.ctx.createBiquadFilter();
    sizzleFilter.type = 'bandpass';
    sizzleFilter.frequency.setValueAtTime(4200, this.ctx.currentTime);
    sizzleFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const sizzleGain = this.ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    sizzleSource.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(this.hearthGain);
    sizzleSource.start();

    return sizzleFilter;
  }

  /**
   * Discrete Wood Pop / Snap:
   * Instantaneous micro-explosion with resonant wood cavity ringing (1.2kHz - 3.2kHz).
   */
  private triggerWoodCrackle(): void {
    if (this.currentAtmosphere !== 'hearth') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Resonant frequency of the burning wood fissure
    const popPitch = 1200 + Math.random() * 2000;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(popPitch, now);
    osc.frequency.exponentialRampToValueAtTime(popPitch * 0.6, now + 0.015);

    const popVol = 0.02 + Math.random() * 0.04;
    gain.gain.setValueAtTime(0.0001, now);
    // Instant attack < 0.4ms
    gain.gain.linearRampToValueAtTime(popVol, now + 0.0004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    if (panner) {
      panner.pan.setValueAtTime((Math.random() * 2 - 1) * 0.7, now);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.hearthGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // =========================================================================
  // 4. Astral Void: Quartz Crystal Singing Bowl Modal Synthesis
  // =========================================================================
  private setupAstral(): void {
    // Exact inharmonic rim vibration modes of a quartz crystal singing bowl:
    // Fundamental f0 (528 Hz), second mode 2.76*f0 (1457 Hz), third mode 5.40*f0 (2851 Hz)
    const modes = [
      { ratio: 1.00, gain: 0.042, pan: -0.4 },
      { ratio: 2.76, gain: 0.022, pan: 0.4 },
      { ratio: 5.40, gain: 0.011, pan: 0.0 }
    ];

    modes.forEach(mode => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528 * mode.ratio, this.ctx.currentTime);
      gain.gain.setValueAtTime(mode.gain, this.ctx.currentTime);

      if (panner) {
        panner.pan.setValueAtTime(mode.pan, this.ctx.currentTime);
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.astralGain);
      osc.start();
      this.astralOscs.push(osc);
    });

    // Slow quadrature friction LFO (0.08 Hz) simulating rotating wand friction
    this.astralLfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.astralLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.008, this.ctx.currentTime);
    this.astralLfo.connect(lfoGain);
    this.astralLfo.start();
  }

  // =========================================================================
  // Micro-Physics Stochastic Timers
  // =========================================================================
  private startMicroPhysicsLoops(): void {
    // 1. Minnaert bubble foam backwash (Poisson interval: 80ms - 220ms)
    const scheduleNextBubble = () => {
      const delay = 80 + Math.random() * 180;
      this.oceanBubbleTimer = window.setTimeout(() => {
        // Trigger bubbles primarily during exhalation (receding wave foam)
        if (this.currentAtmosphere === 'ocean' && this.currentBreathScale < 0.65) {
          this.triggerMinnaertBubble();
          if (Math.random() > 0.6) {
            setTimeout(() => this.triggerMinnaertBubble(), 25);
          }
        }
        scheduleNextBubble();
      }, delay);
    };
    scheduleNextBubble();

    // 2. Poisson Canopy Leaf Droplets (random interval: 140ms - 450ms)
    const scheduleNextRain = () => {
      const delay = 140 + Math.random() * 320;
      this.rainDropletTimer = window.setTimeout(() => {
        if (this.currentAtmosphere === 'rain') {
          this.triggerCanopyDroplet();
        }
        scheduleNextRain();
      }, delay);
    };
    scheduleNextRain();

    // 3. Fire crackle bursts (random interval: 120ms - 380ms)
    const scheduleNextFire = () => {
      const delay = 120 + Math.random() * 260;
      this.hearthCrackleTimer = window.setTimeout(() => {
        if (this.currentAtmosphere === 'hearth' && Math.random() > 0.40) {
          this.triggerWoodCrackle();
          if (Math.random() > 0.7) {
            setTimeout(() => this.triggerWoodCrackle(), 35);
          }
        }
        scheduleNextFire();
      }, delay);
    };
    scheduleNextFire();
  }

  public setAtmosphere(atmosphereId: AtmosphereId): void {
    this.currentAtmosphere = atmosphereId;
    const now = this.ctx.currentTime;
    const fadeDuration = 1.0;

    const targetAurora = atmosphereId === 'aurora' ? 1.0 : 0.0;
    const targetOcean = atmosphereId === 'ocean' ? 1.0 : 0.0;
    const targetRain = atmosphereId === 'rain' ? 1.0 : 0.0;
    const targetHearth = atmosphereId === 'hearth' ? 1.0 : 0.0;
    const targetAstral = atmosphereId === 'astral' ? 1.0 : 0.0;

    this.auroraGain.gain.setTargetAtTime(targetAurora, now, fadeDuration * 0.5);
    this.oceanGain.gain.setTargetAtTime(targetOcean, now, fadeDuration * 0.5);
    this.rainGain.gain.setTargetAtTime(targetRain, now, fadeDuration * 0.5);
    this.hearthGain.gain.setTargetAtTime(targetHearth, now, fadeDuration * 0.5);
    this.astralGain.gain.setTargetAtTime(targetAstral, now, fadeDuration * 0.5);
  }

  public update(breathScale: number, isPlaying: boolean): void {
    if (!isPlaying) return;
    this.currentBreathScale = breathScale;

    const now = this.ctx.currentTime;

    // Modulate ocean groundswell & wavebreaker with breath
    if (this.currentAtmosphere === 'ocean') {
      const swellCutoff = 55 + 95 * Math.pow(breathScale, 1.3);
      const turbCutoff = 220 + 750 * Math.pow(breathScale, 1.4);
      this.oceanSwellFilter.frequency.setTargetAtTime(swellCutoff, now, 0.15);
      this.oceanTurbulenceFilter.frequency.setTargetAtTime(turbCutoff, now, 0.15);
    }

    // Modulate rain intensity with breath
    if (this.currentAtmosphere === 'rain') {
      const rainCutoff = 1100 + 1200 * breathScale;
      this.rainBedFilter.frequency.setTargetAtTime(rainCutoff, now, 0.2);
    }

    // Modulate hearth sizzle with breath (oxygen feeding embers)
    if (this.currentAtmosphere === 'hearth') {
      const sizzleCutoff = 3600 + 1800 * breathScale;
      this.hearthSizzleFilter.frequency.setTargetAtTime(sizzleCutoff, now, 0.2);
    }
  }

  public destroy(): void {
    if (this.oceanBubbleTimer) clearTimeout(this.oceanBubbleTimer);
    if (this.rainDropletTimer) clearTimeout(this.rainDropletTimer);
    if (this.hearthCrackleTimer) clearTimeout(this.hearthCrackleTimer);
    this.astralOscs.forEach(o => o.stop());
    this.astralLfo?.stop();
  }
}
