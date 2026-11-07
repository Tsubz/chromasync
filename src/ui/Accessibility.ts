import { BreathPhase } from '../core/Patterns';

export class AccessibilityManager {
  private liveRegion: HTMLElement | null;

  constructor() {
    this.liveRegion = document.getElementById('a11y-announcer');
  }

  public announcePhase(phase: BreathPhase): void {
    if (!this.liveRegion) return;
    // Phases change every few seconds: announce only the short label ("Inhale", "Hold"…),
    // the full instructions would talk over the next phase
    this.liveRegion.textContent = phase.label;
  }

  public announceMessage(message: string): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = message;
  }
}
