import { beforeEach, describe, expect, it } from "vitest";
import { asString, lsGet, lsSet, oneOf, recordOf, LS_PREFIX } from "./storage";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
  };
});

const put = (key: string, raw: string) => store.set(LS_PREFIX + key, raw);

describe("lsGet", () => {
  it("returns the fallback when the key is missing", () => {
    expect(lsGet("x", 7)).toBe(7);
  });

  it("round-trips a value written by lsSet", () => {
    lsSet("x", { a: 1 });
    expect(lsGet("x", {})).toEqual({ a: 1 });
  });

  it("returns the fallback for invalid JSON", () => {
    put("x", "{not json");
    expect(lsGet("x", "d")).toBe("d");
  });

  it("rejects a value of the wrong JSON type when no coercer is given", () => {
    put("x", "null");
    expect(lsGet("x", {})).toEqual({});
    put("y", "[1]");
    expect(lsGet("y", {})).toEqual({});
    put("z", '"str"');
    expect(lsGet("z", false)).toBe(false);
  });

  it("uses the coercer and falls back when it returns undefined", () => {
    put("theme", '"dark"');
    expect(lsGet("theme", "system", oneOf(["system", "light", "dark"] as const))).toBe("dark");
    put("theme", '"neon"');
    expect(lsGet("theme", "system", oneOf(["system", "light", "dark"] as const))).toBe("system");
    put("theme", "42");
    expect(lsGet("theme", "system", asString)).toBe("system");
  });
});

describe("recordOf", () => {
  it("drops invalid entries but keeps valid ones", () => {
    expect(recordOf(asString)({ a: "x", b: 2, c: null })).toEqual({ a: "x" });
  });

  it("rejects non-records", () => {
    expect(recordOf(asString)(null)).toBeUndefined();
    expect(recordOf(asString)(["a"])).toBeUndefined();
  });
});
