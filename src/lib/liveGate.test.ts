import { describe, expect, it } from "vitest";
import { appData, LANG_NAMES_EN } from "./appData";
import { buildLiveSystemPrompt } from "./liveAi";
import { shouldUseLive } from "./liveGate";
import { detectCategory } from "./scriptedEngine";
import { personaText } from "./personas";

describe("Live AI crisis gate", () => {
  it("sends ordinary messages to the provider only when Live AI is on and a key is set", () => {
    expect(shouldUseLive("en", "What is suffering?", true, "key")).toBe(true);
    expect(shouldUseLive("en", "What is suffering?", false, "key")).toBe(false);
    expect(shouldUseLive("en", "What is suffering?", true, "")).toBe(false);
  });

  it("never sends a crisis message to the provider, in any interface language", () => {
    for (const lang of appData.langs) {
      const own = appData.languages[lang].categories?.crisis?.kw?.[0];
      expect(own, `${lang} has crisis keywords`).toBeTruthy();
      expect(detectCategory(lang, `I ${own} tonight`), `${lang} own keyword`).toBe("crisis");
      expect(shouldUseLive(lang, `I ${own} tonight`, true, "key"), `${lang} own keyword`).toBe(false);
    }
  });

  it("also recognises English crisis wording when the interface is in another language", () => {
    for (const lang of appData.langs) {
      expect(detectCategory(lang, "I want to kill myself"), lang).toBe("crisis");
      expect(shouldUseLive(lang, "I want to kill myself", true, "key"), lang).toBe(false);
    }
  });
});

describe("Live AI system prompt", () => {
  it("names every interface language, so the model answers in it", () => {
    for (const lang of appData.langs) expect(LANG_NAMES_EN[lang], lang).toBeTruthy();
  });

  it("describes the character and the safety rules, in the interface language", () => {
    for (const lang of appData.langs) {
      const prompt = buildLiveSystemPrompt(lang, appData.personaMeta[0], personaText(lang, 0));
      expect(prompt, lang).toContain("Gautama Buddha");
      expect(prompt, lang).toContain(`Respond only in ${LANG_NAMES_EN[lang]}`);
      expect(prompt, lang).toMatch(/not the real person/);
      expect(prompt, lang).toMatch(/crisis resources/);
      expect(prompt, lang).toMatch(/Never give medical, diagnostic, or medication advice/);
    }
  });

  it("is worded for teachings and tradition, not for a clinical frame", () => {
    const prompt = buildLiveSystemPrompt("en", appData.personaMeta[0], personaText("en", 0));
    expect(prompt).toMatch(/teachings and tradition/);
    expect(prompt).not.toMatch(/theoretical frame|licensed clinician/);
  });
});
