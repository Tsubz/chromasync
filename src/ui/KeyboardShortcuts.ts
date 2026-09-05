export interface ShortcutHandlers {
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onSelectPattern: (index: number) => void;
  onNextAtmosphere: () => void;
  onNextTuning: () => void;
  onToggleOled?: () => void;
  onToggleInfo?: () => void;
  onEscape?: () => void;
}

export class KeyboardShortcuts {
  private handlers: ShortcutHandlers;

  constructor(handlers: ShortcutHandlers) {
    this.handlers = handlers;
    this.init();
  }

  private init(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.handlers.onTogglePlay();
          break;
        case 'KeyM':
          e.preventDefault();
          this.handlers.onToggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          this.handlers.onToggleFullscreen();
          break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
          e.preventDefault();
          const idx = parseInt(e.key, 10) - 1;
          this.handlers.onSelectPattern(idx);
          break;
        case 'KeyA':
        case 'KeyP':
          e.preventDefault();
          this.handlers.onNextAtmosphere();
          break;
        case 'KeyT':
          e.preventDefault();
          this.handlers.onNextTuning();
          break;
        case 'KeyO':
          e.preventDefault();
          this.handlers.onToggleOled?.();
          break;
        case 'KeyI':
          e.preventDefault();
          this.handlers.onToggleInfo?.();
          break;
        case 'Escape':
          e.preventDefault();
          this.handlers.onEscape?.();
          break;
      }
    });
  }
}
