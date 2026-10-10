import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { t } from "./i18n";
import { traditionText } from "./traditions";

describe("traditions data", () => {
  it("has 68 numbered, named entries", () => {
    expect(appData.traditions).toHaveLength(68);
    expect(appData.traditions.map((x) => x.num)).toEqual(Array.from({ length: 68 }, (_, i) => i + 1));
    for (const x of appData.traditions) {
      expect(x.n).not.toBe("");
      expect(x.y).not.toBe("");
    }
  });

  it("gives every language a tag for every tradition, falling back to English", () => {
    for (const lang of appData.langs) {
      appData.traditions.forEach((_, i) => {
        expect(traditionText(lang, i).tag, `${lang} #${i + 1}`).not.toBe("");
      });
    }
  });

  it("keeps per-language text parallel to the list", () => {
    for (const lang of appData.langs) {
      const own = appData.languages[lang].traditions;
      if (own) expect(own, lang).toHaveLength(appData.traditions.length);
    }
  });
});

describe("ui text", () => {
  it("falls back to English for strings a language does not translate", () => {
    expect(appData.languages.de.ui.about_p1).toBeUndefined();
    expect(t("de", "about_p1")).toBe(appData.languages.en.ui.about_p1);
  });

  it("uses each language's own name for the app as the brand", () => {
    for (const lang of appData.langs) expect(t(lang, "brand_title"), lang).toBe(t(lang, "traditions_title"));
  });
});
