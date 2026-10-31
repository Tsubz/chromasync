import { BREATHING_PATTERNS, BreathingPattern } from '../core/Patterns';
import { ATMOSPHERES, Atmosphere } from '../core/Atmospheres';
import { BreathState } from '../core/BreathingEngine';
import { SessionDurationMinutes, TimerState } from '../core/SessionTimer';
import { TuningFrequency } from '../audio/SynthChord';
import { t } from '../i18n';
import { CanvasGestures } from './CanvasGestures';
import { enableSwipeToDismiss } from './DrawerSwipe';
import { BreathSettings } from '../core/BreathSettings';
import { resonanceTextParams } from '../core/Patterns';

export interface UIControllerCallbacks {
  onTogglePlay: () => void;
  onToggleSound: () => void;
  onPatternSelect: (patternId: string) => void;
  onAtmosphereSelect: (atmosphere: Atmosphere) => void;
  onTimerSelect: (minutes: SessionDurationMinutes) => void;
  onToggleTuning: () => void;
  onTuningSelect?: (tuning: TuningFrequency, binauralBeat?: number) => void;
  onRestoreHarmony?: (atmosphere: Atmosphere) => void;
  onUserInteraction: () => void;
  onTouchPaceStart?: () => void;
  onTouchPaceEnd?: () => void;
  onTouchContact?: (active: boolean, clientX?: number, clientY?: number) => void;
  onToggleLanguage?: () => void;
}

export class UIController {
  private callbacks: UIControllerCallbacks;
  private currentAtmosphereId: string;
  private currentPatternId: string;
  private currentTuning: TuningFrequency = 432;
  private currentBinauralBeat: number = 5.5;
  private currentDuration: SessionDurationMinutes = 0;

  // DOM Elements
  private phaseLabel: HTMLElement | null;
  private phaseSubtext: HTMLElement | null;
  private ringProgress: SVGCircleElement | null;
  private btnSound: HTMLButtonElement | null;
  private btnFullscreen: HTMLButtonElement | null;
  private btnTimerModal: HTMLButtonElement | null = null;
  private btnPlayPause: HTMLButtonElement | null;
  private playPauseText: HTMLElement | null;
  private patternPillsContainer: HTMLElement | null;
  private atmosphereSwatchesContainer: HTMLElement | null;
  private timerPillsContainer: HTMLElement | null;
  private btnTuning: HTMLButtonElement | null;
  private tuningText: HTMLElement | null;
  private tuningStatusTag: HTMLElement | null;
  private btnOled: HTMLButtonElement | null;
  private btnInfo: HTMLButtonElement | null;

  // Info Drawer elements
  private infoDrawer: HTMLElement | null;
  private drawerBackdrop: HTMLElement | null;
  private btnCloseDrawer: HTMLButtonElement | null;
  private infoAtmIcon: HTMLElement | null;
  private infoAtmTitle: HTMLElement | null;
  private infoAtmDesc: HTMLElement | null;
  private infoAtmSource: HTMLElement | null;
  private infoPatternIcon: HTMLElement | null;
  private infoPatternTitle: HTMLElement | null;
  private infoPatternDesc: HTMLElement | null;
  private infoPatternSource: HTMLElement | null;
  private btnInfoRestore: HTMLButtonElement | null;

  // Dedicated Frequency & Harmony Drawer elements
  private tuningDrawer: HTMLElement | null;
  private tuningDrawerBackdrop: HTMLElement | null;
  private btnCloseTuningDrawer: HTMLButtonElement | null;
  private harmonyStatusBanner: HTMLElement | null;
  private harmonyStatusText: HTMLElement | null;
  private btnRestoreHarmony: HTMLButtonElement | null;
  private frequencyCardsContainer: HTMLElement | null;
  private binauralPillsContainer: HTMLElement | null;

  // Auto-hide HUD timer & Toast timer
  private idleTimer: number | null = null;
  private toastTimer: number | null = null;
  private toastMessage: string | null = null;
  private isHudHidden: boolean = false;
  private ringCircumference: number = 339.292; // 2 * pi * 54
  private isSessionComplete: boolean = false;
  private isOledActive: boolean = false;
  private isDrawerOpen: boolean = false;
  private isTuningDrawerOpen: boolean = false;
  private hasStarted: boolean = false;

  // When OLED mode was last toggled (ignores the click of the enabling double-tap)
  private oledToggledAt: number = 0;

  constructor(callbacks: UIControllerCallbacks, initialPattern: BreathingPattern, initialAtmosphere: Atmosphere) {
    this.callbacks = callbacks;
    this.currentPatternId = initialPattern.id;
    this.currentAtmosphereId = initialAtmosphere.id;
    this.currentTuning = initialAtmosphere.recommendedTuning;
    this.currentBinauralBeat = initialAtmosphere.recommendedBinauralBeat;

    this.phaseLabel = document.getElementById('phase-label');
    this.phaseSubtext = document.getElementById('phase-subtext');
    this.ringProgress = document.getElementById('ring-progress') as unknown as SVGCircleElement | null;
    this.btnSound = document.getElementById('btn-sound') as HTMLButtonElement | null;
    this.btnFullscreen = document.getElementById('btn-fullscreen') as HTMLButtonElement | null;
    this.btnTimerModal = document.getElementById('btn-timer-modal') as HTMLButtonElement | null;
    this.btnPlayPause = document.getElementById('btn-play-pause') as HTMLButtonElement | null;
    this.playPauseText = document.getElementById('play-pause-text');
    this.patternPillsContainer = document.getElementById('pattern-pills');
    this.atmosphereSwatchesContainer = document.getElementById('atmosphere-swatches');
    this.timerPillsContainer = document.getElementById('timer-pills');
    this.btnTuning = document.getElementById('btn-tuning') as HTMLButtonElement | null;
    this.tuningText = document.getElementById('tuning-text');
    this.tuningStatusTag = document.getElementById('tuning-status-tag');
    this.btnOled = document.getElementById('btn-oled') as HTMLButtonElement | null;
    this.btnInfo = document.getElementById('btn-info') as HTMLButtonElement | null;

    // Info Drawer
    this.infoDrawer = document.getElementById('info-drawer');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
    this.btnCloseDrawer = document.getElementById('btn-close-drawer') as HTMLButtonElement | null;
    this.infoAtmIcon = document.getElementById('info-atm-icon');
    this.infoAtmTitle = document.getElementById('info-atm-title');
    this.infoAtmDesc = document.getElementById('info-atm-desc');
    this.infoAtmSource = document.getElementById('info-atm-source');
    this.infoPatternIcon = document.getElementById('info-pattern-icon');
    this.infoPatternTitle = document.getElementById('info-pattern-title');
    this.infoPatternDesc = document.getElementById('info-pattern-desc');
    this.infoPatternSource = document.getElementById('info-pattern-source');
    this.btnInfoRestore = document.getElementById('btn-info-restore') as HTMLButtonElement | null;

    // Tuning & Harmony Drawer
    this.tuningDrawer = document.getElementById('tuning-drawer');
    this.tuningDrawerBackdrop = document.getElementById('tuning-drawer-backdrop');
    this.btnCloseTuningDrawer = document.getElementById('btn-close-tuning-drawer') as HTMLButtonElement | null;
    this.harmonyStatusBanner = document.getElementById('harmony-status-banner');
    this.harmonyStatusText = document.getElementById('harmony-status-text');
    this.btnRestoreHarmony = document.getElementById('btn-restore-harmony') as HTMLButtonElement | null;
    this.frequencyCardsContainer = document.getElementById('frequency-cards');
    this.binauralPillsContainer = document.getElementById('binaural-pills');

    this.initPills();
    this.initAtmosphereSwatches();
    this.initTimerPills();
    this.initTuningDrawer();
    this.initRhythmSettings();
    this.initEventListeners();
    enableSwipeToDismiss(this.infoDrawer, () => this.closeInfoDrawer());
    enableSwipeToDismiss(this.tuningDrawer, () => this.closeTuningDrawer());
    this.resetIdleTimer();
    this.updateTuningBadge(initialAtmosphere.recommendedTuning, initialAtmosphere.binauralLabel);
    this.updateInfoDrawer(initialAtmosphere, initialPattern);
    this.updateHarmonyState();
  }

  private initPills(): void {
    if (!this.patternPillsContainer) return;
    this.patternPillsContainer.innerHTML = '';

    BREATHING_PATTERNS.forEach(pattern => {
      const btn = document.createElement('button');
      btn.className = `pill-btn ${pattern.id === this.currentPatternId ? 'active' : ''}`;
      const fullSpan = document.createElement('span');
      fullSpan.className = 'name-full';
      fullSpan.textContent = pattern.name;

      const shortSpan = document.createElement('span');
      shortSpan.className = 'name-short';
      shortSpan.textContent = pattern.shortName;

      btn.append(fullSpan, shortSpan);
      btn.title = `${pattern.name} — ${pattern.tagline}`;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', pattern.id === this.currentPatternId ? 'true' : 'false');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onUserInteraction();
        this.currentPatternId = pattern.id;
        this.isSessionComplete = false;
        this.toastMessage = null;
        this.updatePillsSelection();
        this.updateInfoDrawer();
        this.updateHarmonyState();
        this.callbacks.onPatternSelect(pattern.id);
      });

      this.patternPillsContainer?.appendChild(btn);
    });
  }

  /** Resonance pace slider and gentle-holds toggle in the info drawer. */
  private initRhythmSettings(): void {
    const slider = document.getElementById('resonance-bpm') as HTMLInputElement | null;
    const valueText = document.getElementById('resonance-bpm-value');
    const gentle = document.getElementById('gentle-holds') as HTMLInputElement | null;

    const render = () => {
      if (slider) slider.value = String(BreathSettings.resonanceBpm);
      if (valueText) valueText.textContent = t('settings.resonanceValue', resonanceTextParams());
      if (gentle) gentle.checked = BreathSettings.gentleHolds;
    };

    slider?.addEventListener('input', () => {
      BreathSettings.resonanceBpm = parseFloat(slider.value);
    });
    gentle?.addEventListener('change', () => {
      BreathSettings.gentleHolds = gentle.checked;
    });

    // Pattern names include the pace ("5.5s Coherence"), so labels are rebuilt on change
    BreathSettings.onChange(() => {
      render();
      this.initPills();
      this.updateInfoDrawer();
    });
    render();
  }

  private updatePillsSelection(): void {
    if (!this.patternPillsContainer) return;
    const buttons = this.patternPillsContainer.querySelectorAll('.pill-btn');
    buttons.forEach((btn, idx) => {
      const pattern = BREATHING_PATTERNS[idx];
      const isActive = pattern.id === this.currentPatternId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  private initAtmosphereSwatches(): void {
    if (!this.atmosphereSwatchesContainer) return;
    this.atmosphereSwatchesContainer.innerHTML = '';

    ATMOSPHERES.forEach(atmosphere => {
      const btn = document.createElement('button');
      btn.className = `atmosphere-btn ${atmosphere.id === this.currentAtmosphereId ? 'active' : ''}`;
      btn.title = `${atmosphere.name} — ${atmosphere.scientificTarget}`;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-label', t('ui.atmosphereAria', { name: atmosphere.name }));
      const iconSpan = document.createElement('span');
      iconSpan.className = 'atm-icon';
      iconSpan.textContent = atmosphere.icon;

      const fullSpan = document.createElement('span');
      fullSpan.className = 'name-full';
      fullSpan.textContent = atmosphere.name;

      const shortSpan = document.createElement('span');
      shortSpan.className = 'name-short';
      shortSpan.textContent = atmosphere.shortName;

      btn.append(iconSpan, document.createTextNode(' '), fullSpan, shortSpan);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onUserInteraction();
        this.currentAtmosphereId = atmosphere.id;
        this.currentTuning = atmosphere.recommendedTuning;
        this.currentBinauralBeat = atmosphere.recommendedBinauralBeat;
        this.updateAtmosphereSelection();
        this.updateInfoDrawer(atmosphere);
        this.updateHarmonyState();
        this.callbacks.onAtmosphereSelect(atmosphere);
      });

      this.atmosphereSwatchesContainer?.appendChild(btn);
    });
  }

  private updateAtmosphereSelection(): void {
    if (!this.atmosphereSwatchesContainer) return;
    const buttons = this.atmosphereSwatchesContainer.querySelectorAll('.atmosphere-btn');
    buttons.forEach((btn, idx) => {
      const atmosphere = ATMOSPHERES[idx];
      const isActive = atmosphere.id === this.currentAtmosphereId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  private initTimerPills(): void {
    if (!this.timerPillsContainer) return;
    const buttons = this.timerPillsContainer.querySelectorAll<HTMLButtonElement>('.timer-pill');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onUserInteraction();
        const mins = parseInt(btn.dataset.mins || '0', 10) as SessionDurationMinutes;
        this.setDurationSelection(mins);
        
        this.isSessionComplete = false;
        this.callbacks.onTimerSelect(mins);
      });
    });
  }

  private initTuningDrawer(): void {
    // Frequency cards selection
    const freqCards = this.frequencyCardsContainer?.querySelectorAll<HTMLButtonElement>('.freq-card');
    freqCards?.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onUserInteraction();
        const freq = parseInt(card.dataset.freq || '432', 10) as TuningFrequency;
        this.currentTuning = freq;
        this.updateTuningDrawerSelection();
        this.updateHarmonyState();
        this.callbacks.onTuningSelect?.(freq, this.currentBinauralBeat);
      });
    });

    // Binaural pills selection
    const beatPills = this.binauralPillsContainer?.querySelectorAll<HTMLButtonElement>('.binaural-pill');
    beatPills?.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onUserInteraction();
        const beat = parseFloat(pill.dataset.beat || '5.5');
        this.currentBinauralBeat = beat;
        this.updateTuningDrawerSelection();
        this.updateHarmonyState();
        this.callbacks.onTuningSelect?.(this.currentTuning, beat);
      });
    });

    // One-tap restore buttons
    const handleRestore = (e: MouseEvent) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.restoreOptimalHarmony();
    };

    this.btnRestoreHarmony?.addEventListener('click', handleRestore);
    this.btnInfoRestore?.addEventListener('click', handleRestore);
  }

  private updateTuningDrawerSelection(): void {
    // Frequency cards
    const freqCards = this.frequencyCardsContainer?.querySelectorAll<HTMLButtonElement>('.freq-card');
    freqCards?.forEach(card => {
      const freq = parseInt(card.dataset.freq || '432', 10);
      card.classList.toggle('active', freq === this.currentTuning);
    });

    // Binaural pills
    const beatPills = this.binauralPillsContainer?.querySelectorAll<HTMLButtonElement>('.binaural-pill');
    beatPills?.forEach(pill => {
      const beat = parseFloat(pill.dataset.beat || '5.5');
      pill.classList.toggle('active', Math.abs(beat - this.currentBinauralBeat) < 0.1);
    });
  }

  private initEventListeners(): void {
    // Sound button
    this.btnSound?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.callbacks.onToggleSound();
    });

    // Tuning button opens dedicated Harmony Drawer
    this.btnTuning?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.toggleTuningDrawer();
    });

    // Fullscreen button
    this.btnFullscreen?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.toggleFullscreen();
    });

    // Mobile quick timer button (cycles durations)
    this.btnTimerModal?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      const durations: SessionDurationMinutes[] = [0, 3, 5, 10];
      const nextDuration = durations[(durations.indexOf(this.currentDuration) + 1) % durations.length];
      this.setDurationSelection(nextDuration);

      this.isSessionComplete = false;
      this.callbacks.onTimerSelect(nextDuration);

      const label = nextDuration === 0 ? t('ui.sessionUnlimited') : t('ui.sessionMinutes', { mins: nextDuration });
      this.toastMessage = t('ui.sessionToast', { label });
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        this.toastMessage = null;
      }, 2500);
    });

    // OLED Noir toggle button
    this.btnOled?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.toggleOledMode();
    });

    // Info Drawer toggle button
    this.btnInfo?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.toggleInfoDrawer();
    });

    this.btnCloseDrawer?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeInfoDrawer();
    });

    this.drawerBackdrop?.addEventListener('click', () => {
      this.closeInfoDrawer();
    });

    // Tuning Drawer close listeners
    this.btnCloseTuningDrawer?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTuningDrawer();
    });

    this.tuningDrawerBackdrop?.addEventListener('click', () => {
      this.closeTuningDrawer();
    });

    document.getElementById('btn-language')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onToggleLanguage?.();
    });

    // Play/Pause button
    this.btnPlayPause?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.onUserInteraction();
      this.isSessionComplete = false;
      this.callbacks.onTogglePlay();
    });

    new CanvasGestures(document.getElementById('gl-canvas'), {
      isOledActive: () => this.isOledActive,
      exitOled: () => this.exitOledMode(),
      toggleOled: () => this.toggleOledMode(),
      onInteraction: () => {
        this.callbacks.onUserInteraction();
        this.wakeFromSleepDimmer();
      },
      isFreeFlow: () => this.currentPatternId === 'free_flow',
      onTap: () => {
        this.isSessionComplete = false;
        this.callbacks.onTogglePlay();
      },
      onHoldStart: () => this.callbacks.onTouchPaceStart?.(),
      onHoldEnd: () => this.callbacks.onTouchPaceEnd?.(),
      onContact: (active, x, y) => this.callbacks.onTouchContact?.(active, x, y),
      onSwipe: direction => (direction < 0 ? this.cycleNextAtmosphere() : this.cyclePrevAtmosphere())
    });

    // Global tap-to-wake from OLED mode
    document.addEventListener('click', () => {
      // Ignore the click generated by the double-tap that just enabled OLED mode
      if (this.isOledActive && performance.now() - this.oledToggledAt > 400) {
        this.exitOledMode();
      }
    });

    // Activity reset
    const resetActivity = () => {
      this.wakeFromSleepDimmer();
      this.showHUD();
      this.resetIdleTimer();
    };

    window.addEventListener('mousemove', resetActivity, { passive: true });
    window.addEventListener('touchstart', resetActivity, { passive: true });
    window.addEventListener('pointermove', resetActivity, { passive: true });
  }

  public updateHarmonyState(): void {
    const currentAtm = ATMOSPHERES.find(a => a.id === this.currentAtmosphereId) || ATMOSPHERES[0];
    const isFreqMatch = this.currentTuning === currentAtm.recommendedTuning;
    const isBeatMatch = Math.abs(this.currentBinauralBeat - currentAtm.recommendedBinauralBeat) < 0.1;
    const isPatternMatch = this.currentPatternId === 'free_flow' || this.currentPatternId === currentAtm.recommendedPatternId;
    const isFullyHarmonized = isFreqMatch && isBeatMatch && isPatternMatch;

    // Update Header Tuning Badge
    if (this.btnTuning && this.tuningText && this.tuningStatusTag) {
      const tuningIcon = this.btnTuning.querySelector('.tuning-icon');
      if (tuningIcon) {
        tuningIcon.textContent = isFullyHarmonized ? '✨' : '∿';
      }
      this.tuningText.textContent = `${this.currentTuning} Hz`;
      this.tuningStatusTag.textContent = isFullyHarmonized ? t('harmony.harmonized') : t('harmony.custom');

      this.btnTuning.classList.toggle('is-harmonized', isFullyHarmonized);
      this.btnTuning.classList.toggle('is-custom', !isFullyHarmonized);
      this.btnTuning.title = isFullyHarmonized 
        ? t('harmony.titleHarmonized', { name: currentAtm.name, hz: this.currentTuning })
        : t('harmony.titleCustom', { hz: this.currentTuning });
    }

    // Update Tuning Drawer Status Banner
    if (this.harmonyStatusBanner && this.harmonyStatusText && this.btnRestoreHarmony) {
      this.harmonyStatusBanner.classList.toggle('is-harmonized', isFullyHarmonized);
      this.harmonyStatusBanner.classList.toggle('is-custom', !isFullyHarmonized);

      if (isFullyHarmonized) {
        this.harmonyStatusText.textContent = t('harmony.inResonance', { name: currentAtm.name });
        this.btnRestoreHarmony.classList.add('hidden');
      } else {
        const reason = !isFreqMatch
          ? t('harmony.reasonFreq', { hz: this.currentTuning, rec: currentAtm.recommendedTuning })
          : !isPatternMatch
          ? t('harmony.reasonPattern', { name: currentAtm.name })
          : t('harmony.reasonBeat');
        this.harmonyStatusText.textContent = t('harmony.customReason', { reason });
        this.btnRestoreHarmony.classList.remove('hidden');
        this.btnRestoreHarmony.textContent = t('harmony.restore', { hz: currentAtm.recommendedTuning });
      }
    }

    // Update Info Drawer Restore Button
    if (this.btnInfoRestore) {
      if (isFullyHarmonized) {
        this.btnInfoRestore.classList.add('hidden');
      } else {
        this.btnInfoRestore.classList.remove('hidden');
        this.btnInfoRestore.textContent = t('harmony.restoreFull', { hz: currentAtm.recommendedTuning, beat: currentAtm.binauralLabel });
      }
    }

    // Highlight recommended badge tags in Tuning Drawer
    const recTags = this.frequencyCardsContainer?.querySelectorAll<HTMLElement>('.freq-rec-tag');
    recTags?.forEach(tag => {
      const recFreq = parseInt(tag.dataset.rec || '0', 10);
      tag.classList.toggle('hidden', recFreq !== currentAtm.recommendedTuning);
    });

    this.updateTuningDrawerSelection();
  }

  public restoreOptimalHarmony(): void {
    const currentAtm = ATMOSPHERES.find(a => a.id === this.currentAtmosphereId) || ATMOSPHERES[0];
    this.currentTuning = currentAtm.recommendedTuning;
    this.currentBinauralBeat = currentAtm.recommendedBinauralBeat;
    this.currentPatternId = currentAtm.recommendedPatternId;

    this.updatePillsSelection();
    this.updateHarmonyState();
    this.callbacks.onRestoreHarmony?.(currentAtm);

    this.closeTuningDrawer();
    this.closeInfoDrawer();

    // Show celebratory toast
    this.toastMessage = t('harmony.restored', { name: currentAtm.name, hz: currentAtm.recommendedTuning, beat: currentAtm.binauralLabel });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  public toggleTuningDrawer(): void {
    if (this.isTuningDrawerOpen) {
      this.closeTuningDrawer();
    } else {
      this.openTuningDrawer();
    }
  }

  public openTuningDrawer(): void {
    this.closeInfoDrawer();
    this.isTuningDrawerOpen = true;
    this.updateHarmonyState();
    this.tuningDrawer?.classList.remove('hidden');
    this.tuningDrawer?.setAttribute('aria-hidden', 'false');
  }

  public closeTuningDrawer(): void {
    this.isTuningDrawerOpen = false;
    this.tuningDrawer?.classList.add('hidden');
    this.tuningDrawer?.setAttribute('aria-hidden', 'true');
  }

  public toggleOledMode(): boolean {
    this.isOledActive = !this.isOledActive;
    this.oledToggledAt = performance.now();
    if (this.isOledActive) {
      document.body.classList.add('oled-black-active');
      this.btnOled?.classList.add('active');
    } else {
      document.body.classList.remove('oled-black-active');
      this.btnOled?.classList.remove('active');
    }
    return this.isOledActive;
  }

  public exitOledMode(): void {
    if (!this.isOledActive) return;
    this.isOledActive = false;
    document.body.classList.remove('oled-black-active');
    this.btnOled?.classList.remove('active');
  }

  public toggleInfoDrawer(): void {
    if (this.isDrawerOpen) {
      this.closeInfoDrawer();
    } else {
      this.openInfoDrawer();
    }
  }

  public openInfoDrawer(): void {
    this.closeTuningDrawer();
    this.isDrawerOpen = true;
    this.updateInfoDrawer();
    this.updateHarmonyState();
    this.infoDrawer?.classList.remove('hidden');
    this.infoDrawer?.setAttribute('aria-hidden', 'false');
  }

  public closeInfoDrawer(): void {
    this.isDrawerOpen = false;
    this.infoDrawer?.classList.add('hidden');
    this.infoDrawer?.setAttribute('aria-hidden', 'true');
  }

  public updateInfoDrawer(atmosphere?: Atmosphere, pattern?: BreathingPattern): void {
    const currentAtm = atmosphere || ATMOSPHERES.find(a => a.id === this.currentAtmosphereId) || ATMOSPHERES[0];
    const currentPat = pattern || BREATHING_PATTERNS.find(p => p.id === this.currentPatternId) || BREATHING_PATTERNS[0];

    if (this.infoAtmIcon) this.infoAtmIcon.textContent = currentAtm.icon;
    if (this.infoAtmTitle) this.infoAtmTitle.textContent = `${currentAtm.name} (${currentAtm.recommendedTuning} Hz)`;
    if (this.infoAtmDesc) this.infoAtmDesc.textContent = currentAtm.description;
    if (this.infoAtmSource) this.infoAtmSource.textContent = t('ui.source', { source: currentAtm.scientificSource });

    if (this.infoPatternIcon) this.infoPatternIcon.textContent = '🫁';
    if (this.infoPatternTitle) this.infoPatternTitle.textContent = `${currentPat.name} — ${currentPat.tagline}`;
    if (this.infoPatternDesc) this.infoPatternDesc.textContent = currentPat.description;
    if (this.infoPatternSource) this.infoPatternSource.textContent = t('ui.source', { source: currentPat.scientificSource });
  }

  public updateAfterHarmonization(atmosphere: Atmosphere, pattern: BreathingPattern): void {
    this.currentAtmosphereId = atmosphere.id;
    this.currentPatternId = pattern.id;
    this.currentTuning = atmosphere.recommendedTuning;
    this.currentBinauralBeat = atmosphere.recommendedBinauralBeat;

    this.updatePillsSelection();
    this.updateAtmosphereSelection();
    this.updateTuningBadge(atmosphere.recommendedTuning, atmosphere.binauralLabel);
    this.updateInfoDrawer(atmosphere, pattern);
    this.updateHarmonyState();

    // Show temporary scientific toast in subtitle
    this.toastMessage = `${atmosphere.icon} ${atmosphere.name} · ${atmosphere.recommendedTuning} Hz ${atmosphere.binauralLabel} · ${pattern.name}`;
    
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage = null;
    }, 3200);
  }

  public updateAfterAtmosphereHarmonization(atmosphere: Atmosphere): void {
    const pairedPat = BREATHING_PATTERNS.find(p => p.id === atmosphere.recommendedPatternId) || BREATHING_PATTERNS[0];
    this.updateAfterHarmonization(atmosphere, pairedPat);
  }

  public updateState(state: BreathState, timerState?: TimerState): void {
    if (this.isSessionComplete) {
      if (this.phaseLabel) this.phaseLabel.textContent = t('ui.peaceWithin');
      if (this.phaseSubtext) this.phaseSubtext.textContent = t('ui.completeSubtext');
      if (this.ringProgress) this.ringProgress.style.strokeDashoffset = '0';
      return;
    }

    if (state.isPlaying) this.hasStarted = true;

    // Update central phase labels
    if (this.phaseLabel) {
      if (!state.isPlaying) {
        this.phaseLabel.textContent = this.hasStarted ? t('ui.paused') : t('ui.beginTitle');
      } else {
        this.phaseLabel.textContent = state.currentPhase.label;
      }
    }

    if (this.phaseSubtext) {
      if (this.toastMessage) {
        this.phaseSubtext.textContent = this.toastMessage;
      } else if (!state.isPlaying) {
        this.phaseSubtext.textContent = this.hasStarted ? t('ui.resumeHint') : t('ui.beginHint');
      } else if (timerState && timerState.isFinishingCycle) {
        this.phaseSubtext.textContent = `${state.currentPhase.subtext} · ${t('ui.finalBreath')}`;
      } else if (timerState && timerState.isActive) {
        const mins = Math.floor(timerState.remainingSeconds / 60);
        const secs = Math.floor(timerState.remainingSeconds % 60);
        const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        this.phaseSubtext.textContent = `${state.currentPhase.subtext} · ${timeStr}`;
      } else {
        this.phaseSubtext.textContent = state.currentPhase.subtext;
      }
    }

    // Update circular progress ring
    if (this.ringProgress) {
      const offset = this.ringCircumference * (1.0 - state.phaseProgress);
      this.ringProgress.style.strokeDashoffset = `${offset}`;
    }

    // Update play/pause button icon & text
    if (this.btnPlayPause && this.playPauseText) {
      const iconPlay = this.btnPlayPause.querySelector('.icon-play');
      const iconPause = this.btnPlayPause.querySelector('.icon-pause');

      if (state.isPlaying) {
        iconPlay?.classList.add('hidden');
        iconPause?.classList.remove('hidden');
        this.playPauseText.textContent = t('ui.pause');
      } else {
        iconPlay?.classList.remove('hidden');
        iconPause?.classList.add('hidden');
        this.playPauseText.textContent = t('ui.breathe');
      }
    }
  }

  public showSessionComplete(): void {
    this.isSessionComplete = true;
    document.body.classList.add('sleep-dimmer-active');
    if (this.phaseLabel) this.phaseLabel.textContent = t('ui.restNow');
    if (this.phaseSubtext) this.phaseSubtext.textContent = t('ui.restSubtext');
    if (this.btnPlayPause && this.playPauseText) {
      const iconPlay = this.btnPlayPause.querySelector('.icon-play');
      const iconPause = this.btnPlayPause.querySelector('.icon-pause');
      iconPlay?.classList.remove('hidden');
      iconPause?.classList.add('hidden');
      this.playPauseText.textContent = t('ui.beginAgain');
    }
  }

  public setDurationSelection(minutes: SessionDurationMinutes): void {
    this.currentDuration = minutes;
    const buttons = this.timerPillsContainer?.querySelectorAll<HTMLButtonElement>('.timer-pill');
    buttons?.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.mins || '0', 10) === minutes);
    });
  }

  public wakeFromSleepDimmer(): void {
    document.body.classList.remove('sleep-dimmer-active');
  }

  public updateTuningBadge(tuning: TuningFrequency, binauralLabel?: string): void {
    if (this.tuningText) {
      this.currentTuning = tuning;
      this.tuningText.textContent = `${tuning} Hz`;
      if (this.btnTuning) {
        this.btnTuning.title = t('harmony.badgeTitle', { hz: tuning, beat: binauralLabel ? ` · ${binauralLabel}` : '' });
      }
    }
    this.updateHarmonyState();
  }

  public updateSoundState(isMuted: boolean): void {
    if (!this.btnSound) return;
    const soundOn = this.btnSound.querySelector('.icon-sound-on');
    const soundOff = this.btnSound.querySelector('.icon-sound-off');

    if (isMuted) {
      soundOn?.classList.add('hidden');
      soundOff?.classList.remove('hidden');
    } else {
      soundOn?.classList.remove('hidden');
      soundOff?.classList.add('hidden');
    }
  }

  public cycleNextAtmosphere(): Atmosphere {
    const currentIdx = ATMOSPHERES.findIndex(a => a.id === this.currentAtmosphereId);
    const nextIdx = (currentIdx + 1) % ATMOSPHERES.length;
    const nextAtmosphere = ATMOSPHERES[nextIdx];
    this.currentAtmosphereId = nextAtmosphere.id;
    this.currentTuning = nextAtmosphere.recommendedTuning;
    this.currentBinauralBeat = nextAtmosphere.recommendedBinauralBeat;
    this.updateAtmosphereSelection();
    this.updateInfoDrawer(nextAtmosphere);
    this.updateHarmonyState();
    this.callbacks.onAtmosphereSelect(nextAtmosphere);
    return nextAtmosphere;
  }

  public cyclePrevAtmosphere(): Atmosphere {
    const currentIdx = ATMOSPHERES.findIndex(a => a.id === this.currentAtmosphereId);
    const prevIdx = (currentIdx - 1 + ATMOSPHERES.length) % ATMOSPHERES.length;
    const prevAtmosphere = ATMOSPHERES[prevIdx];
    this.currentAtmosphereId = prevAtmosphere.id;
    this.currentTuning = prevAtmosphere.recommendedTuning;
    this.currentBinauralBeat = prevAtmosphere.recommendedBinauralBeat;
    this.updateAtmosphereSelection();
    this.updateInfoDrawer(prevAtmosphere);
    this.updateHarmonyState();
    this.callbacks.onAtmosphereSelect(prevAtmosphere);
    return prevAtmosphere;
  }

  public isTuningDrawerCurrentlyOpen(): boolean {
    return this.isTuningDrawerOpen;
  }

  public isInfoDrawerCurrentlyOpen(): boolean {
    return this.isDrawerOpen;
  }

  public isOledModeActive(): boolean {
    return this.isOledActive;
  }

  /** True once OLED mode has fully faded the canvas out, so rendering can stop. */
  public isCanvasHidden(): boolean {
    return this.isOledActive && performance.now() - this.oledToggledAt > 1000;
  }

  public selectPatternByIndex(idx: number): void {
    if (idx >= 0 && idx < BREATHING_PATTERNS.length) {
      const pattern = BREATHING_PATTERNS[idx];
      this.currentPatternId = pattern.id;
      this.isSessionComplete = false;
      this.toastMessage = null;
      this.updatePillsSelection();
      this.updateInfoDrawer();
      this.updateHarmonyState();
      this.callbacks.onPatternSelect(pattern.id);
    }
  }

  public toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    this.updateFullscreenIcon();
  }

  private updateFullscreenIcon(): void {
    if (!this.btnFullscreen) return;
    const iconEnter = this.btnFullscreen.querySelector('.icon-fullscreen-enter');
    const iconExit = this.btnFullscreen.querySelector('.icon-fullscreen-exit');
    
    setTimeout(() => {
      const isFs = !!document.fullscreenElement;
      if (isFs) {
        iconEnter?.classList.add('hidden');
        iconExit?.classList.remove('hidden');
      } else {
        iconEnter?.classList.remove('hidden');
        iconExit?.classList.add('hidden');
      }
    }, 50);
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      window.clearTimeout(this.idleTimer);
    }
    this.idleTimer = window.setTimeout(() => {
      this.hideHUD();
    }, 5000);
  }

  private hideHUD(): void {
    if (this.isHudHidden || this.isDrawerOpen || this.isTuningDrawerOpen) return;
    this.isHudHidden = true;
    document.body.classList.add('hud-hidden');
  }

  private showHUD(): void {
    if (!this.isHudHidden) return;
    this.isHudHidden = false;
    document.body.classList.remove('hud-hidden');
  }
}
