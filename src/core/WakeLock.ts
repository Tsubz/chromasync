export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private isRequested: boolean = false;

  constructor() {
    this.initVisibilityListener();
  }

  public async acquire(): Promise<void> {
    this.isRequested = true;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    try {
      if (!this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      }
    } catch {
      // Gracefully handle low battery or permission rejection
    }
  }

  public async release(): Promise<void> {
    this.isRequested = false;
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {
        // Ignore
      }
      this.wakeLock = null;
    }
  }

  private initVisibilityListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isRequested) {
        await this.acquire();
      }
    });
  }
}
