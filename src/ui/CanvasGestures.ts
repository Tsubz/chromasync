export interface CanvasGestureHandlers {
  /** OLED mode turns any touch into "wake up" */
  isOledActive: () => boolean;
  exitOled: () => void;
  toggleOled: () => void;
  /** Any touch on the canvas (unlock audio, wake the dimmer) */
  onInteraction: () => void;
  /** Free-flow mode inhales immediately on touch instead of waiting for a hold */
  isFreeFlow: () => boolean;
  onTap: () => void;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onContact: (active: boolean, clientX?: number, clientY?: number) => void;
  /** -1: swipe left (next atmosphere), 1: swipe right (previous) */
  onSwipe: (direction: -1 | 1) => void;
}

const HOLD_DELAY_MS = 220;
const DOUBLE_TAP_MS = 300;
const SWIPE_MIN_PX = 65;
const SWIPE_MAX_MS = 400;

/**
 * Canvas touch vocabulary: tap toggles playback, double-tap toggles OLED mode,
 * hold paces the breath by touch, horizontal swipe changes atmosphere.
 */
export class CanvasGestures {
  private pressStartTime = 0;
  private pressStartX = 0;
  private pressStartY = 0;
  private isPressing = false;
  private hasSwiped = false;
  private lastTapTime = 0;
  private holdTimer: number | null = null;
  private isHolding = false;
  private suppressNextTap = false;

  constructor(canvas: HTMLElement | null, private handlers: CanvasGestureHandlers) {
    canvas?.addEventListener('pointerdown', e => this.onPointerDown(e));
    canvas?.addEventListener('pointermove', e => this.onPointerMove(e));
    // Released anywhere: the finger may slide off the canvas while holding
    window.addEventListener('pointerup', () => this.onPointerUp());
    window.addEventListener('pointercancel', () => this.onPointerUp());
  }

  private onPointerDown(e: PointerEvent): void {
    if (this.handlers.isOledActive()) {
      this.handlers.exitOled();
      return;
    }

    this.handlers.onInteraction();
    const now = performance.now();
    this.isPressing = true;
    this.pressStartTime = now;
    this.pressStartX = e.clientX;
    this.pressStartY = e.clientY;
    this.hasSwiped = false;

    if (now - this.lastTapTime < DOUBLE_TAP_MS) {
      this.clearHoldTimer();
      this.lastTapTime = 0;
      this.handlers.toggleOled();
      // The first tap already toggled playback; undo it so a double-tap only switches OLED mode
      this.suppressNextTap = true;
      this.handlers.onTap();
      return;
    }
    this.lastTapTime = now;

    this.handlers.onContact(true, e.clientX, e.clientY);

    if (this.handlers.isFreeFlow()) {
      this.startHold();
    } else {
      this.holdTimer = window.setTimeout(() => this.startHold(), HOLD_DELAY_MS);
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isPressing) return;

    if (!this.isHolding && !this.hasSwiped) {
      const dx = e.clientX - this.pressStartX;
      const dy = e.clientY - this.pressStartY;
      const elapsed = performance.now() - this.pressStartTime;
      if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > 1.6 * Math.abs(dy) && elapsed < SWIPE_MAX_MS) {
        this.hasSwiped = true;
        this.clearHoldTimer();
        this.handlers.onSwipe(dx < 0 ? -1 : 1);
        return;
      }
    }

    if (this.isHolding) {
      this.handlers.onContact(true, e.clientX, e.clientY);
    }
  }

  private onPointerUp(): void {
    if (!this.isPressing) return;
    this.isPressing = false;
    this.clearHoldTimer();
    this.handlers.onContact(false);

    if (this.hasSwiped) {
      this.hasSwiped = false;
      return;
    }

    if (this.isHolding) {
      this.isHolding = false;
      this.handlers.onHoldEnd();
    } else if (!this.handlers.isFreeFlow()) {
      if (this.suppressNextTap) {
        this.suppressNextTap = false;
      } else if (performance.now() - this.pressStartTime < HOLD_DELAY_MS) {
        this.handlers.onTap();
      }
    }
  }

  private startHold(): void {
    this.holdTimer = null;
    this.isHolding = true;
    this.handlers.onHoldStart();
  }

  private clearHoldTimer(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }
}
