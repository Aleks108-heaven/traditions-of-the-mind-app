export const LS_PREFIX = "traditionsofthemind_";

/** Turns an untrusted parsed value into T, or returns undefined if it can't be salvaged. */
export type Coerce<T> = (value: unknown) => T | undefined;

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const asString: Coerce<string> = (v) => (typeof v === "string" ? v : undefined);
export const asBoolean: Coerce<boolean> = (v) => (typeof v === "boolean" ? v : undefined);

export function oneOf<T extends string>(allowed: readonly T[]): Coerce<T> {
  return (v) => (typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined);
}

/** A string→V record; entries whose value fails `coerceValue` are dropped instead of rejecting the whole record. */
export function recordOf<V>(coerceValue: Coerce<V>): Coerce<Record<string, V>> {
  return (v) => {
    if (!isRecord(v)) return undefined;
    const out: Record<string, V> = {};
    for (const [k, raw] of Object.entries(v)) {
      const val = coerceValue(raw);
      if (val !== undefined) out[k] = val;
    }
    return out;
  };
}

export const asFiniteNumber: Coerce<number> = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

/**
 * Reads a persisted value. localStorage is user-editable and survives app upgrades, so the
 * parsed JSON is never trusted: `coerce` must vouch for the shape, otherwise `fallback` wins.
 * Without `coerce`, the value must at least have the same JSON type as `fallback`.
 */
export function lsGet<T>(key: string, fallback: T, coerce?: Coerce<T>): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (coerce) {
      const v = coerce(parsed);
      return v === undefined ? fallback : v;
    }
    const sameType =
      typeof parsed === typeof fallback &&
      Array.isArray(parsed) === Array.isArray(fallback) &&
      (parsed === null) === (fallback === null);
    return sameType ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage can throw in private-browsing / storage-full situations;
    // losing persistence there is acceptable, crashing the app is not.
  }
}
