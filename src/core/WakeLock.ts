import { Capacitor, registerPlugin } from '@capacitor/core';

interface KeepAwakePlugin {
  keepAwake(): Promise<void>;
  allowSleep(): Promise<void>;
}

// Native implementations: android/.../KeepAwakePlugin.java (FLAG_KEEP_SCREEN_ON) and
// ios/App/App/MainViewController.swift (isIdleTimerDisabled). The web Screen Wake Lock API
// is not reliably available inside the platform WebViews.
const KeepAwake = registerPlugin<KeepAwakePlugin>('KeepAwake');

export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private isRequested: boolean = false;
  private readonly isNative = Capacitor.isNativePlatform();

  constructor() {
    this.initVisibilityListener();
  }

  public async acquire(): Promise<void> {
    this.isRequested = true;
    if (this.isNative) {
      await KeepAwake.keepAwake().catch(() => {});
      return;
    }
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
    if (this.isNative) {
      await KeepAwake.allowSleep().catch(() => {});
      return;
    }
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
    if (typeof document === 'undefined' || this.isNative) return;

    // The browser drops the wake lock when the page is hidden; take it back on return
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isRequested) {
        await this.acquire();
      }
    });
  }
}
