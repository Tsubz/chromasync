export interface ShortcutHandlers {
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onSelectPattern: (index: number) => void;
  onNextAtmosphere: () => void;
  onNextTuning: () => void;
  onToggleOled?: () => void;
  onToggleInfo?: () => void;
  onRecordReel?: () => void;
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

      // Leave browser shortcuts (Ctrl+R, Cmd+F, …) alone
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Digits use the physical key (AZERTY needs Shift to type them); letters use the
      // typed character so "M" mutes on AZERTY and QWERTY alike
      const digit = /^(Digit|Numpad)([1-6])$/.exec(e.code);
      if (digit) {
        e.preventDefault();
        this.handlers.onSelectPattern(parseInt(digit[2], 10) - 1);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this.handlers.onTogglePlay();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.handlers.onEscape?.();
        return;
      }

      const actions: Record<string, (() => void) | undefined> = {
        m: this.handlers.onToggleMute,
        f: this.handlers.onToggleFullscreen,
        a: this.handlers.onNextAtmosphere,
        p: this.handlers.onNextAtmosphere,
        t: this.handlers.onNextTuning,
        o: this.handlers.onToggleOled,
        i: this.handlers.onToggleInfo,
        r: this.handlers.onRecordReel
      };
      const action = actions[e.key.toLowerCase()];
      if (action) {
        e.preventDefault();
        action();
      }
    });
  }
}
