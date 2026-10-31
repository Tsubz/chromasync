export interface PreferenceValues {
  locale: string;
  atmosphereId: string;
  patternId: string;
  durationMinutes: number;
  muted: boolean;
  resonanceBpm: number;
  gentleHolds: boolean;
}

const STORAGE_KEY = 'chromasync:prefs:v1';

/**
 * Small persisted settings store. Storage can be unavailable (private mode,
 * blocked site data), so every access is guarded and falls back to defaults.
 */
export class Preferences {
  private static cache: Partial<PreferenceValues> | null = null;

  private static load(): Partial<PreferenceValues> {
    if (this.cache) return this.cache;
    try {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      this.cache = parsed && typeof parsed === 'object' ? parsed as Partial<PreferenceValues> : {};
    } catch {
      this.cache = {};
    }
    return this.cache;
  }

  public static get<K extends keyof PreferenceValues>(key: K): PreferenceValues[K] | undefined {
    return this.load()[key];
  }

  public static set<K extends keyof PreferenceValues>(key: K, value: PreferenceValues[K]): void {
    const values = { ...this.load(), [key]: value };
    this.cache = values;
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Persisting is best-effort only
    }
  }

  /** Test hook: forget the in-memory copy so the next read hits storage again. */
  public static resetCache(): void {
    this.cache = null;
  }
}
