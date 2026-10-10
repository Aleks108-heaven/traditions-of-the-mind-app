import { afterEach, describe, expect, it, vi } from "vitest";
import { crProviderReply, LiveAiError } from "./liveAi";

const KEY = "AIza-secret-key";

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fn = vi.fn(async () => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: async () => JSON.stringify(body),
  }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("crProviderReply", () => {
  it("throws no-key without calling the network", async () => {
    const fetchFn = mockFetch({});
    await expect(crProviderReply("gemini", "", "", "sys", [], "")).rejects.toMatchObject({ kind: "no-key" });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("sends the Gemini key in a header, never in the URL", async () => {
    const fetchFn = mockFetch({ candidates: [{ content: { parts: [{ text: " hi " }] } }] });
    const reply = await crProviderReply("gemini", KEY, "", "sys", [{ role: "user", content: "yo" }], "");
    expect(reply).toBe("hi");
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
    expect(url).not.toContain(KEY);
    expect(url).not.toContain("key=");
    expect(init.headers["x-goog-api-key"]).toBe(KEY);
  });

  it("uses the custom base URL for OpenAI-compatible providers", async () => {
    const fetchFn = mockFetch({ choices: [{ message: { content: "ok" } }] });
    await crProviderReply("openai", KEY, "m", "sys", [], " http://localhost:11434/v1 ");
    expect((fetchFn.mock.calls[0] as unknown as [string])[0]).toBe("http://localhost:11434/v1/chat/completions");
  });

  it("reports HTTP errors as LiveAiError(http)", async () => {
    mockFetch({ error: "bad key" }, { ok: false, status: 401 });
    await expect(crProviderReply("groq", KEY, "", "sys", [], "")).rejects.toMatchObject({
      kind: "http",
      name: "LiveAiError",
    });
  });

  it("reports an empty provider reply", async () => {
    mockFetch({ choices: [] });
    const err = await crProviderReply("groq", KEY, "", "sys", [], "").catch((e) => e);
    expect(err).toBeInstanceOf(LiveAiError);
    expect(err.kind).toBe("empty");
  });
});
