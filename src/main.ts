import './fonts';
import './style.css';
import { BreathingEngine } from './core/BreathingEngine';
import { SessionTimer } from './core/SessionTimer';
import { HapticsManager } from './core/Haptics';
import { WakeLockManager } from './core/WakeLock';
import { ATMOSPHERES, Atmosphere } from './core/Atmospheres';
import { BREATHING_PATTERNS } from './core/Patterns';
import { ShaderRenderer } from './graphics/ShaderRenderer';
import { AudioEngine } from './audio/AudioEngine';
import { AccessibilityManager } from './ui/Accessibility';
import { UIController } from './ui/UIController';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { StudioRecorder } from './ui/StudioRecorder';
import { App } from '@capacitor/app';
import { applyStaticTranslations, getLocale, setLocale, t } from './i18n';
import { Preferences } from './core/Preferences';
import { SessionDurationMinutes } from './core/SessionTimer';
import { parseDeepLink } from './core/DeepLink';

class ChromasyncApp {
  private engine: BreathingEngine;
  private timer: SessionTimer;
  private haptics: HapticsManager;
  private wakeLock: WakeLockManager;
  private renderer: ShaderRenderer;
  private audio: AudioEngine;
  private a11y: AccessibilityManager;
  private ui: UIController;
  private studioRecorder: StudioRecorder;

  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!this.canvas) throw new Error('Canvas element not found');

    applyStaticTranslations();

    // A link (e.g. from the science pages) wins over the last session's saved settings
    const link = parseDeepLink(window.location.search, BREATHING_PATTERNS.map(p => p.id), ATMOSPHERES.map(a => a.id));
    const defaultAtmosphere = ATMOSPHERES.find(a => a.id === (link.atmosphereId ?? Preferences.get('atmosphereId'))) ?? ATMOSPHERES[0];
    const defaultPattern = BREATHING_PATTERNS.find(p => p.id === link.patternId)
      ?? (link.atmosphereId ? undefined : BREATHING_PATTERNS.find(p => p.id === Preferences.get('patternId')))
      ?? BREATHING_PATTERNS.find(p => p.id === defaultAtmosphere.recommendedPatternId)
      ?? BREATHING_PATTERNS[0];
    const savedDuration = Preferences.get('durationMinutes');
    const initialDuration: SessionDurationMinutes =
      savedDuration === 3 || savedDuration === 5 || savedDuration === 10 ? savedDuration : 0;

    // Core systems
    this.engine = new BreathingEngine(defaultPattern.id);
    this.timer = new SessionTimer(initialDuration);
    this.haptics = new HapticsManager();
    this.wakeLock = new WakeLockManager();
    this.renderer = new ShaderRenderer(this.canvas, defaultAtmosphere);
    this.canvas = this.renderer.getCanvas();
    this.audio = new AudioEngine();
    this.audio.setAtmosphere(defaultAtmosphere);
    this.audio.setMuted(Preferences.get('muted') === true);
    this.a11y = new AccessibilityManager();

    // UI Manager
    this.ui = new UIController(
      {
        onTogglePlay: () => this.handleTogglePlay(),
        onToggleSound: () => this.handleToggleSound(),
        onPatternSelect: (patternId) => this.handlePatternChange(patternId),
        onAtmosphereSelect: (atmosphere) => this.handleAtmosphereChange(atmosphere),
        onTimerSelect: (mins) => {
          this.timer.setDuration(mins);
          Preferences.set('durationMinutes', mins);
        },
        onToggleTuning: () => this.ui.toggleTuningDrawer(),
        onTuningSelect: (tuning, beat) => {
          this.audio.unlock();
          this.audio.setTuningAndBeat(tuning, beat ?? this.audio.getBinauralBeat());
          this.a11y.announceMessage(t('a11y.tuningSet', { hz: tuning }));
        },
        onRestoreHarmony: (atmosphere) => {
          this.handleAtmosphereChange(atmosphere);
          this.haptics.pulseCompletion();
        },
        onUserInteraction: () => this.audio.unlock(),
        onTouchPaceStart: () => {
          this.audio.unlock();
          this.wakeLock.acquire();
          this.engine.setTouchPacing(true);
          this.haptics.pulsePhase('inhale');
        },
        onTouchPaceEnd: () => {
          this.engine.setTouchPacing(false);
          this.haptics.pulsePhase('exhale');
        },
        onTouchContact: (active, clientX, clientY) => {
          this.renderer.setTouchContact(active, clientX, clientY);
        },
        onToggleLanguage: () => {
          setLocale(getLocale() === 'fr' ? 'en' : 'fr');
          window.location.reload();
        }
      },
      defaultPattern,
      defaultAtmosphere
    );
    this.ui.setDurationSelection(initialDuration);
    if (link.tuning) {
      this.audio.setTuningAndBeat(link.tuning, defaultAtmosphere.recommendedBinauralBeat);
      this.ui.updateTuningBadge(link.tuning);
    }
    this.ui.updateSoundState(this.audio.getIsMuted());

    // Studio Reel Exporter (GPU + Web Audio Recording)
    this.studioRecorder = new StudioRecorder(this.canvas, this.audio);

    // Keyboard Shortcuts
    new KeyboardShortcuts({
      onTogglePlay: () => this.handleTogglePlay(),
      onToggleMute: () => this.handleToggleSound(),
      onToggleFullscreen: () => this.ui.toggleFullscreen(),
      onSelectPattern: (idx) => this.handlePatternSelectByIndex(idx),
      onNextAtmosphere: () => {
        const nextAtmosphere = this.ui.cycleNextAtmosphere();
        this.handleAtmosphereChange(nextAtmosphere);
      },
      onNextTuning: () => this.ui.toggleTuningDrawer(),
      onToggleOled: () => this.ui.toggleOledMode(),
      onToggleInfo: () => this.ui.toggleInfoDrawer(),
      onRecordReel: () => this.studioRecorder.startRecording(11),
      onEscape: () => {
        this.ui.closeInfoDrawer();
        this.ui.closeTuningDrawer();
        this.ui.exitOledMode();
      }
    });

    this.initEvents();
    this.registerServiceWorker();
    this.startLoop();
  }

  private handlePatternSelectByIndex(idx: number): void {
    if (idx >= 0 && idx < BREATHING_PATTERNS.length) {
      this.handlePatternChange(BREATHING_PATTERNS[idx].id);
    }
  }

  private handlePatternChange(patternId: string): void {
    const pattern = BREATHING_PATTERNS.find(p => p.id === patternId);
    if (!pattern) return;

    const currentAtmId = this.audio.getCurrentAtmosphereId();
    const pairedAtmosphere = (pattern.id === 'free_flow')
      ? (ATMOSPHERES.find(a => a.id === currentAtmId) || ATMOSPHERES[0])
      : (ATMOSPHERES.find(a => a.id === pattern.recommendedAtmosphereId) || ATMOSPHERES[0]);

    // 1. Update Engine Breathing Pattern
    this.engine.setPattern(pattern.id);

    // 2. Auto-Harmonize GPU visual shaders
    this.renderer.setAtmosphere(pairedAtmosphere);

    // 3. Auto-Harmonize procedural audio, carrier frequency & binaural beat
    this.audio.setAtmosphere(pairedAtmosphere);

    // 4. Update UI pills, atmosphere swatches, tuning badge & scientific toast
    this.ui.updateAfterHarmonization(pairedAtmosphere, pattern);

    // 5. Screen reader announcement
    this.a11y.announceMessage(t('a11y.patternActive', {
      pattern: pattern.name,
      atmosphere: pairedAtmosphere.name,
      hz: pairedAtmosphere.recommendedTuning
    }));

    this.saveSelection(pairedAtmosphere.id, pattern.id);
  }

  private handleAtmosphereChange(atmosphere: Atmosphere): void {
    const pairedPattern = BREATHING_PATTERNS.find(p => p.id === atmosphere.recommendedPatternId) || BREATHING_PATTERNS[0];

    // 1. Update GPU visual shaders
    this.renderer.setAtmosphere(atmosphere);

    // 2. Auto-Harmonize procedural audio, carrier frequency & binaural beat
    this.audio.setAtmosphere(atmosphere);

    // 3. Auto-Harmonize breathing rhythm pattern
    this.engine.setPattern(pairedPattern.id);

    // 4. Update UI pills, atmosphere swatches, tuning badge & scientific toast
    this.ui.updateAfterHarmonization(atmosphere, pairedPattern);

    // 5. Announce to screen reader
    this.a11y.announceMessage(t('a11y.atmosphereActive', {
      atmosphere: atmosphere.name,
      hz: atmosphere.recommendedTuning,
      beat: atmosphere.binauralLabel,
      pattern: pairedPattern.name
    }));

    this.saveSelection(atmosphere.id, pairedPattern.id);
  }

  private saveSelection(atmosphereId: string, patternId: string): void {
    Preferences.set('atmosphereId', atmosphereId);
    Preferences.set('patternId', patternId);
  }

  private initEvents(): void {
    // Phase change notifications
    this.engine.onPhaseTransition((_, toPhase, isCycleComplete) => {
      const isSessionFinished = this.timer.checkCycleCompletion(isCycleComplete);

      if (!isSessionFinished) {
        this.a11y.announcePhase(toPhase);
        this.audio.triggerPhaseCue(toPhase.type);
        this.haptics.pulsePhase(toPhase.type);
      }
    });

    // Session Timer completion
    this.timer.onComplete(() => {
      this.engine.pause();
      this.wakeLock.release();
      this.audio.strikeTibetanBowl();
      this.haptics.pulseCompletion();
      this.ui.showSessionComplete();
      this.a11y.announceMessage(t('a11y.complete'));
    });

    // rAF stops in the background, which would freeze the guide while the drone keeps playing:
    // pause instead, and let the user resume explicitly when they come back
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine.getState().isPlaying) {
        this.handleTogglePlay();
        this.audio.update(0, false);
      }
    });

    // Window, viewport and orientation resize handling
    const handleResize = () => {
      this.renderer.resize();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('fullscreenchange', handleResize, { passive: true });

    // First user gesture unlocks audio. Starting the session is left to the gesture's own
    // handler (tap / Space / play button) so the first tap does not start then pause.
    const unlockOnFirstTouch = () => {
      this.audio.unlock();
      window.removeEventListener('pointerdown', unlockOnFirstTouch);
      window.removeEventListener('keydown', unlockOnFirstTouch);
    };

    window.addEventListener('pointerdown', unlockOnFirstTouch);
    window.addEventListener('keydown', unlockOnFirstTouch);

    // Native Android Hardware Back Button Integration
    try {
      App.addListener('backButton', () => {
        if (this.ui.isTuningDrawerCurrentlyOpen()) {
          this.ui.closeTuningDrawer();
          return;
        }
        if (this.ui.isInfoDrawerCurrentlyOpen()) {
          this.ui.closeInfoDrawer();
          return;
        }
        if (this.ui.isOledModeActive()) {
          this.ui.exitOledMode();
          return;
        }
        if (this.engine.getState().isPlaying) {
          this.handleTogglePlay();
          return;
        }
        App.exitApp();
      });
    } catch {
      // Graceful fallback if not running on native Capacitor Android
    }
  }

  private handleTogglePlay(): void {
    this.audio.unlock();
    const isStarting = !this.engine.getState().isPlaying;
    if (isStarting && this.timer.getState().isComplete) {
      // "Begin again" after a finished session restarts the countdown
      this.timer.reset();
    }
    const isPlaying = this.engine.togglePlay();
    if (isPlaying) {
      this.wakeLock.acquire();
      this.a11y.announceMessage(t('a11y.resumed'));
    } else {
      this.wakeLock.release();
      this.a11y.announceMessage(t('a11y.paused'));
    }
  }

  private handleToggleSound(): void {
    const isMuted = this.audio.toggleMute();
    Preferences.set('muted', isMuted);
    this.ui.updateSoundState(isMuted);
    this.a11y.announceMessage(isMuted ? t('a11y.muted') : t('a11y.unmuted'));
  }

  private registerServiceWorker(): void {
    // Only register service worker in production builds to prevent dev/remote-session caching issues
    if (import.meta.env.PROD && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          reg.update();
        }).catch(() => {
          // Ignored in non-sw environments
        });
      });
    }
  }

  private startLoop(): void {
    const loop = (timestamp: number) => {
      // 1. Update clocks & timer
      this.engine.update(timestamp);
      const state = this.engine.getState();
      this.timer.update(timestamp, state.isPlaying);
      // Touch pacing has no fixed cycle, so a finishing session ends once the lungs are empty
      if (state.isTouchPacing && this.timer.getState().isFinishingCycle
          && state.currentPhase.type === 'exhale' && state.breathScale <= 0.04) {
        this.timer.checkCycleCompletion(true);
      }
      const timerState = this.timer.getState();

      // 2. Render visual field
      this.renderer.render(state, timestamp);

      // 3. Modulate procedural audio
      this.audio.update(state.breathScale, state.isPlaying);

      // 4. Update UI overlay
      this.ui.updateState(state, timerState);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Robust bootstrap: if module executed after DOMContentLoaded, initialize immediately
function bootstrap(): void {
  new ChromasyncApp();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
