/**
 * Lowers the canvas's internal resolution when the device cannot keep up with its display
 * refresh rate, and raises it again when there is headroom. The visuals are soft, so a lower
 * internal resolution is barely visible but cuts GPU work (and heat) quadratically.
 *
 * Fed with the interval between consecutive rendered frames while a session is playing.
 */
export class AdaptiveResolution {
  public scale = 1;

  private samples = 0;
  private average = 0;
  private slowSince = 0;
  private fastSince = 0;

  constructor(
    private readonly minScale = 0.5,
    private readonly maxScale = 1,
    /** Frames slower than the 60 fps target × this for a while lower the resolution (≈43 fps) */
    private readonly slowRatio = 1.4,
    /** Frames faster than the target × this for a while raise it again (≈52 fps) */
    private readonly fastRatio = 1.15,
    private readonly lowerAfterMs = 1000,
    private readonly raiseAfterMs = 5000
  ) {}

  /** Returns true when the scale changed and the canvas must be resized. */
  public sample(intervalMs: number, now: number): boolean {
    // Gaps of over a second (tab switch, pause, debugger) say nothing about rendering cost;
    // anything shorter is real, possibly very slow, rendering
    if (intervalMs <= 0 || intervalMs > 1000) {
      this.reset();
      return false;
    }
    intervalMs = Math.min(intervalMs, 250);

    // Fixed 60 fps target. Measuring the display's own rate is unreliable (a slow device never
    // shows a fast frame), and slow breathing visuals gain nothing above 60 fps: a 120 Hz screen
    // running at 60 fps, e.g. in low-power mode, does not count as struggling
    const baseline = 1000 / 60;
    this.average = this.average ? this.average * 0.9 + intervalMs * 0.1 : intervalMs;
    this.samples++;

    // Wait for a meaningful average before judging
    if (this.samples < 10) return false;

    if (this.average > baseline * this.slowRatio && this.scale > this.minScale) {
      this.fastSince = 0;
      if (!this.slowSince) this.slowSince = now;
      if (now - this.slowSince >= this.lowerAfterMs) {
        this.scale = Math.max(this.minScale, this.scale * 0.85);
        this.slowSince = now;
        this.average = 0;
        return true;
      }
      return false;
    }
    this.slowSince = 0;

    if (this.average < baseline * this.fastRatio && this.scale < this.maxScale) {
      if (!this.fastSince) this.fastSince = now;
      if (now - this.fastSince >= this.raiseAfterMs) {
        this.scale = Math.min(this.maxScale, this.scale * 1.1);
        this.fastSince = now;
        return true;
      }
      return false;
    }
    this.fastSince = 0;
    return false;
  }

  public reset(): void {
    this.average = 0;
    this.slowSince = 0;
    this.fastSince = 0;
  }
}
