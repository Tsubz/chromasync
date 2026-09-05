import { BreathPhase } from '../core/Patterns';

export class AccessibilityManager {
  private liveRegion: HTMLElement | null;

  constructor() {
    this.liveRegion = document.getElementById('a11y-announcer');
  }

  public announcePhase(phase: BreathPhase): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = `${phase.label}: ${phase.subtext}`;
  }

  public announceMessage(message: string): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = message;
  }
}
