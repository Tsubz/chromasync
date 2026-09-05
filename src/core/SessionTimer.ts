export type SessionDurationMinutes = 0 | 3 | 5 | 10;

export interface TimerState {
  targetSeconds: number; // 0 for infinite
  elapsedSeconds: number;
  remainingSeconds: number;
  isFinishingCycle: boolean;
  isComplete: boolean;
  isActive: boolean;
}

export type TimerListener = (state: TimerState) => void;
export type CompletionListener = () => void;

export class SessionTimer {
  private targetSeconds: number = 0; // 0 = infinite
  private elapsedSeconds: number = 0;
  private isFinishingCycle: boolean = false;
  private isComplete: boolean = false;
  private lastTimestamp: number = 0;

  private timerListeners: Set<TimerListener> = new Set();
  private completionListeners: Set<CompletionListener> = new Set();

  constructor(initialMinutes: SessionDurationMinutes = 0) {
    this.setDuration(initialMinutes);
  }

  public setDuration(minutes: SessionDurationMinutes): void {
    this.targetSeconds = minutes * 60;
    this.elapsedSeconds = 0;
    this.isFinishingCycle = false;
    this.isComplete = false;
    this.notifyState();
  }

  public getTargetMinutes(): SessionDurationMinutes {
    const mins = Math.round(this.targetSeconds / 60);
    return (mins === 3 || mins === 5 || mins === 10) ? mins : 0;
  }

  public update(timestamp: number, isPlaying: boolean): void {
    if (!isPlaying || this.targetSeconds === 0 || this.isComplete) {
      this.lastTimestamp = timestamp;
      return;
    }

    const delta = (timestamp - (this.lastTimestamp || timestamp)) / 1000;
    this.lastTimestamp = timestamp;

    if (delta <= 0 || delta > 1.0) return;

    this.elapsedSeconds += delta;

    if (this.elapsedSeconds >= this.targetSeconds && !this.isFinishingCycle) {
      this.elapsedSeconds = this.targetSeconds;
      this.isFinishingCycle = true;
    }

    this.notifyState();
  }

  /**
   * Called on every breath phase transition.
   * If isEndOfCycle is true (cycle completed) and timer was waiting to finish, triggers graceful completion.
   */
  public checkCycleCompletion(isEndOfCycle: boolean): boolean {
    if (this.isFinishingCycle && isEndOfCycle && !this.isComplete) {
      this.isComplete = true;
      this.isFinishingCycle = false;
      this.notifyCompletion();
      this.notifyState();
      return true;
    }
    return false;
  }

  public getState(): TimerState {
    const remaining = this.targetSeconds > 0 
      ? Math.max(0, this.targetSeconds - this.elapsedSeconds)
      : 0;

    return {
      targetSeconds: this.targetSeconds,
      elapsedSeconds: this.elapsedSeconds,
      remainingSeconds: remaining,
      isFinishingCycle: this.isFinishingCycle,
      isComplete: this.isComplete,
      isActive: this.targetSeconds > 0 && !this.isComplete
    };
  }

  public reset(): void {
    this.elapsedSeconds = 0;
    this.isFinishingCycle = false;
    this.isComplete = false;
    this.notifyState();
  }

  public onTimerUpdate(listener: TimerListener): () => void {
    this.timerListeners.add(listener);
    return () => this.timerListeners.delete(listener);
  }

  public onComplete(listener: CompletionListener): () => void {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  private notifyState(): void {
    const state = this.getState();
    this.timerListeners.forEach(listener => listener(state));
  }

  private notifyCompletion(): void {
    this.completionListeners.forEach(listener => listener());
  }
}
