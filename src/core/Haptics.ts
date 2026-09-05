import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { BreathPhaseType } from './Patterns';

export class HapticsManager {
  private isNavigatorVibrateSupported: boolean;

  constructor() {
    this.isNavigatorVibrateSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public async pulsePhase(phaseType: BreathPhaseType): Promise<void> {
    try {
      switch (phaseType) {
        case 'inhale':
          // Crisp, gentle upward tap marking inspiration start
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'hold_in':
          // Double micro-notch: cardiac systolic / fullness notch
          await Haptics.impact({ style: ImpactStyle.Medium });
          setTimeout(async () => {
            try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
          }, 80);
          break;
        case 'exhale':
          // Soothing descending release
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'hold_out':
          // Soft resting stillness tick
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
      }
    } catch {
      // Fallback to web vibration API if Capacitor native plugin is unavailable
      this.fallbackVibratePhase(phaseType);
    }
  }

  public async pulseTick(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (this.isNavigatorVibrateSupported) {
        try { navigator.vibrate(15); } catch {}
      }
    }
  }

  public async pulseSelection(): Promise<void> {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch {
      if (this.isNavigatorVibrateSupported) {
        try { navigator.vibrate(18); } catch {}
      }
    }
  }

  public async pulseCompletion(): Promise<void> {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (this.isNavigatorVibrateSupported) {
        try {
          navigator.vibrate([40, 100, 40, 100, 80]);
        } catch {}
      }
    }
  }

  private fallbackVibratePhase(phaseType: BreathPhaseType): void {
    if (!this.isNavigatorVibrateSupported) return;
    try {
      switch (phaseType) {
        case 'inhale':
          navigator.vibrate(28);
          break;
        case 'hold_in':
          navigator.vibrate([16, 40, 16]);
          break;
        case 'exhale':
          navigator.vibrate([20, 45, 22]);
          break;
        case 'hold_out':
          navigator.vibrate(16);
          break;
      }
    } catch {}
  }
}
