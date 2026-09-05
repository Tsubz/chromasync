import { BreathingPattern, BreathPhase, BreathPhaseType, BREATHING_PATTERNS } from './Patterns';

export interface BreathState {
  isPlaying: boolean;
  pattern: BreathingPattern;
  phaseIndex: number;
  currentPhase: BreathPhase;
  phaseProgress: number; // 0.0 to 1.0 within active phase
  cycleProgress: number; // 0.0 to 1.0 overall in the full cycle
  breathScale: number;   // 0.0 (fully exhaled) to 1.0 (fully inhaled)
  tempoMultiplier: number;
  isTouchPacing?: boolean;
}

export type StateListener = (state: BreathState) => void;
export type PhaseTransitionListener = (fromPhase: BreathPhase | null, toPhase: BreathPhase) => void;

export class BreathingEngine {
  private pattern: BreathingPattern;
  private isPlaying: boolean = false;
  private phaseIndex: number = 0;
  private phaseElapsedTime: number = 0; // in seconds
  private tempoMultiplier: number = 1.0;
  private lastTimestamp: number = 0;

  // Touch-Pacer interactive state
  private isTouchPacing: boolean = false;
  private touchBreathScale: number = 0.0;
  private isTouchInhaling: boolean = false;
  private touchReleaseTimestamp: number = 0;

  private stateListeners: Set<StateListener> = new Set();
  private transitionListeners: Set<PhaseTransitionListener> = new Set();

  constructor(initialPatternId?: string) {
    const found = BREATHING_PATTERNS.find(p => p.id === initialPatternId);
    this.pattern = found ?? BREATHING_PATTERNS[0];
  }

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.notifyState();
  }

  public pause(): void {
    this.isPlaying = false;
    this.isTouchPacing = false;
    this.notifyState();
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public setPattern(patternId: string): void {
    const found = BREATHING_PATTERNS.find(p => p.id === patternId);
    if (!found) return;
    
    const prevPhase = this.getCurrentPhase();
    this.pattern = found;
    this.phaseIndex = 0;
    this.phaseElapsedTime = 0;
    if (found.id === 'free_flow') {
      this.isTouchPacing = true;
      this.isTouchInhaling = false;
      this.touchBreathScale = 0.0;
    } else {
      this.isTouchPacing = false;
    }
    
    this.notifyTransition(prevPhase, this.getCurrentPhase());
    this.notifyState();
  }

  public setTempo(multiplier: number): void {
    this.tempoMultiplier = Math.max(0.5, Math.min(2.0, multiplier));
    this.notifyState();
  }

  public setTouchPacing(isHolding: boolean): void {
    this.isTouchPacing = true;
    this.isTouchInhaling = isHolding;
    if (!isHolding) {
      this.touchReleaseTimestamp = performance.now();
    }
    if (!this.isPlaying) {
      this.start();
    }
  }

  public stopTouchPacing(): void {
    this.isTouchPacing = false;
  }

  public getIsTouchPacing(): boolean {
    return this.isTouchPacing;
  }

  public update(timestamp: number): void {
    if (!this.isPlaying) {
      this.lastTimestamp = timestamp;
      return;
    }

    const delta = (timestamp - (this.lastTimestamp || timestamp)) / 1000;
    this.lastTimestamp = timestamp;

    if (delta <= 0 || delta > 1.0) {
      return;
    }

    // Interactive Touch-Pacer / Free Flow mode
    const isFreeFlowMode = this.pattern.id === 'free_flow';
    if (this.isTouchPacing || isFreeFlowMode) {
      this.isTouchPacing = true;
      if (this.isTouchInhaling) {
        // Elastic compliance curve: gentle onset, full thoracic expansion, cushioned top
        const distanceRemaining = Math.max(0.001, 1.02 - this.touchBreathScale);
        const velocity = 0.32 * Math.pow(distanceRemaining, 0.68);
        this.touchBreathScale = Math.min(1.0, this.touchBreathScale + delta * velocity);
      } else {
        // Elastic passive recoil: natural diaphragmatic relaxation slowing down to stillness
        const distanceRemaining = Math.max(0.001, this.touchBreathScale + 0.04);
        const velocity = 0.26 * Math.pow(distanceRemaining, 0.72);
        this.touchBreathScale = Math.max(0.0, this.touchBreathScale - delta * velocity);

        // Only return to preset if NOT in dedicated free_flow mode and after 10s of stillness
        if (!isFreeFlowMode && timestamp - this.touchReleaseTimestamp > 10000) {
          this.isTouchPacing = false;
          this.phaseIndex = 0;
          this.phaseElapsedTime = 0;
        }
      }
      this.notifyState();
      return;
    }

    const currentPhase = this.getCurrentPhase();
    const effectiveDuration = currentPhase.duration / this.tempoMultiplier;

    this.phaseElapsedTime += delta;

    if (this.phaseElapsedTime >= effectiveDuration) {
      const prevPhase = currentPhase;
      this.phaseElapsedTime -= effectiveDuration;
      this.phaseIndex = (this.phaseIndex + 1) % this.pattern.phases.length;
      
      const newPhase = this.getCurrentPhase();
      this.notifyTransition(prevPhase, newPhase);
    }

    this.notifyState();
  }

  public getState(): BreathState {
    if (this.isTouchPacing || this.pattern.id === 'free_flow') {
      const isHoldFull = this.touchBreathScale >= 0.96;
      const isHoldEmpty = this.touchBreathScale <= 0.04;

      let label = 'Inspiration Libre';
      let subtext = 'Maintenez le doigt posé pour inspirer';

      if (!this.isTouchInhaling) {
        if (isHoldEmpty) {
          label = 'Silence & Présence';
          subtext = 'Poumons vides · Posez votre doigt pour inspirer à votre gré';
        } else {
          label = 'Expiration Libre';
          subtext = 'L\'air se dissipe doucement dans le calme';
        }
      } else if (isHoldFull) {
        label = 'Pleins Poumons';
        subtext = 'Habitez la plénitude · Relâchez quand vous êtes prêt';
      }

      const touchPhase: BreathPhase = {
        type: this.isTouchInhaling ? 'inhale' : 'exhale',
        duration: 0,
        label,
        subtext
      };

      return {
        isPlaying: this.isPlaying,
        pattern: this.pattern,
        phaseIndex: this.phaseIndex,
        currentPhase: touchPhase,
        phaseProgress: this.touchBreathScale,
        cycleProgress: this.touchBreathScale,
        breathScale: this.touchBreathScale,
        tempoMultiplier: this.tempoMultiplier,
        isTouchPacing: true
      };
    }

    const currentPhase = this.getCurrentPhase();
    const effectiveDuration = currentPhase.duration / this.tempoMultiplier;
    const rawProgress = Math.min(1.0, Math.max(0.0, this.phaseElapsedTime / effectiveDuration));

    const smoothProgress = 0.5 * (1.0 - Math.cos(Math.PI * rawProgress));
    const breathScale = this.computeBreathScale(currentPhase.type, smoothProgress);
    const cycleProgress = this.computeCycleProgress();

    return {
      isPlaying: this.isPlaying,
      pattern: this.pattern,
      phaseIndex: this.phaseIndex,
      currentPhase,
      phaseProgress: rawProgress,
      cycleProgress,
      breathScale,
      tempoMultiplier: this.tempoMultiplier,
      isTouchPacing: false
    };
  }

  public onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  public onPhaseTransition(listener: PhaseTransitionListener): () => void {
    this.transitionListeners.add(listener);
    return () => this.transitionListeners.delete(listener);
  }

  private getCurrentPhase(): BreathPhase {
    return this.pattern.phases[this.phaseIndex];
  }

  private computeBreathScale(type: BreathPhaseType, smoothProgress: number): number {
    // Special neurobiological curve for Stanford Physiological Sigh
    if (this.pattern.id === 'sigh_huberman') {
      if (this.phaseIndex === 0) {
        // Deep nasal inhale: 0.0 -> 0.78
        return 0.78 * smoothProgress;
      } else if (this.phaseIndex === 1) {
        // Second top-up nasal inhale: 0.78 -> 1.0
        return 0.78 + 0.22 * smoothProgress;
      } else {
        // Extended relaxing mouth exhale: 1.0 -> 0.0
        return 1.0 - smoothProgress;
      }
    }

    switch (type) {
      case 'inhale':
        return smoothProgress; // 0.0 -> 1.0
      case 'hold_in':
        return 1.0 - 0.02 * Math.sin(smoothProgress * Math.PI);
      case 'exhale':
        return 1.0 - smoothProgress; // 1.0 -> 0.0
      case 'hold_out':
        return 0.02 * Math.sin(smoothProgress * Math.PI);
      default:
        return 0.0;
    }
  }

  private computeCycleProgress(): number {
    const totalCycleDuration = this.pattern.phases.reduce((sum, p) => sum + p.duration, 0);
    if (totalCycleDuration === 0) return 0;

    let elapsedSoFar = 0;
    for (let i = 0; i < this.phaseIndex; i++) {
      elapsedSoFar += this.pattern.phases[i].duration;
    }
    elapsedSoFar += this.phaseElapsedTime * this.tempoMultiplier;

    return Math.min(1.0, Math.max(0.0, elapsedSoFar / totalCycleDuration));
  }

  private notifyState(): void {
    const state = this.getState();
    this.stateListeners.forEach(listener => listener(state));
  }

  private notifyTransition(fromPhase: BreathPhase | null, toPhase: BreathPhase): void {
    this.transitionListeners.forEach(listener => listener(fromPhase, toPhase));
  }
}
