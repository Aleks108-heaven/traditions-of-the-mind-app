import { describe, expect, it } from "vitest";
import { appData } from "./appData";
import { capitalizeFirst, tidyGrammar } from "./grammar";
import { fillTemplate, openerFor, respond } from "./scriptedEngine";

describe("grammar pass for assembled replies", () => {
  it("capitalises the start of a sentence, past opening punctuation", () => {
    expect(capitalizeFirst("what's going on for you is already here")).toBe("What's going on for you is already here");
    expect(capitalizeFirst("¿qué pasa?")).toBe("¿Qué pasa?");
    expect(capitalizeFirst("Already capital")).toBe("Already capital");
    expect(capitalizeFirst("3 months")).toBe("3 months");
  });

  it("contracts preposition + article in Portuguese", () => {
    expect(tidyGrammar("pt", "Antes de o que se passa consigo ser nomeado")).toBe("Antes do que se passa consigo ser nomeado");
    expect(tidyGrammar("pt", "Como seria trabalhar em o que se passa consigo")).toBe("Como seria trabalhar no que se passa consigo");
    expect(tidyGrammar("pt", "O que acontece a o que se passa consigo")).toBe("O que acontece ao que se passa consigo");
    expect(tidyGrammar("pt", "A consciência está perturbada por o que se passa consigo")).toBe(
      "A consciência está perturbada pelo que se passa consigo"
    );
    expect(tidyGrammar("pt", "Em o que se passa consigo")).toBe("No que se passa consigo");
  });

  it("contracts preposition + article in Catalan and drops a doubled ending", () => {
    expect(tidyGrammar("ca", "Què canviaria a el que et passa")).toBe("Què canviaria al que et passa");
    expect(tidyGrammar("ca", "què és conscient de el que et passa")).toBe("Què és conscient del que et passa");
    expect(tidyGrammar("ca", "el que et passa ara mateix ara mateix, abans")).toBe("El que et passa ara mateix, abans");
  });

  it("leaves other languages' wording alone", () => {
    expect(tidyGrammar("en", "Look at what's there")).toBe("Look at what's there");
    expect(tidyGrammar("fr", "Asseyez-vous comme vous vous assiériez")).toBe("Asseyez-vous comme vous vous assiériez");
  });
});

describe("opening lines read as sentences in every language", () => {
  it("never start in lower case, repeat a word, or leave an uncontracted preposition", () => {
    const problems: string[] = [];
    for (const lang of appData.langs) {
      for (let idx = 0; idx < appData.personaMeta.length; idx++) {
        // draw every opener of this character's mode a few times (the engine shuffles them)
        for (let i = 0; i < 8; i++) {
          const text = openerFor(lang, idx);
          if (/^[\p{P}\s]*\p{Ll}/u.test(text)) problems.push(`${lang}/${idx} lower-case start: ${text.slice(0, 60)}`);
          if (/(?<![\p{L}'])(ara mateix) \1/iu.test(text)) problems.push(`${lang}/${idx} doubled phrase: ${text}`);
          if (lang === "pt" && /(?<![\p{L}'])(de|em|a|por) o que/iu.test(text)) problems.push(`${lang}/${idx}: ${text}`);
          if (lang === "ca" && /(?<![\p{L}'])(de|a) el que/iu.test(text)) problems.push(`${lang}/${idx}: ${text}`);
          if (lang === "en" && /\bwhat what\b/i.test(text)) problems.push(`${lang}/${idx}: ${text}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("holds for replies to every kind of message too", () => {
    const problems: string[] = [];
    const personas = [0, 7, 15, appData.personaMeta.length - 1];
    for (const lang of appData.langs) {
      const cats = appData.languages[lang].categories ?? {};
      for (const cat of appData.categoryOrder) {
        const kw = cats[cat]?.kw?.[0] ?? appData.languages.en.categories[cat].kw[0];
        for (const idx of personas) {
          for (let turn = 1; turn <= 12; turn++) {
            const reply = respond(lang, idx, kw, turn);
            const text = reply.text;
            if (/^[\p{P}\s]*\p{Ll}/u.test(text)) problems.push(`${lang}/${cat}/${idx} lower-case start: ${text.slice(0, 70)}`);
            if (lang === "pt" && /(?<![\p{L}'])(de|em|a|por) o que/iu.test(text)) problems.push(`${lang}/${cat}: ${text}`);
            if (lang === "ca" && /(?<![\p{L}'])(de|a) el que/iu.test(text)) problems.push(`${lang}/${cat}: ${text}`);
            if (lang === "ca" && /(ara mateix) \1/iu.test(text)) problems.push(`${lang}/${cat}: ${text}`);
            if (lang === "en" && /\b(what|the|a|of|in) \1\b/i.test(text)) problems.push(`${lang}/${cat}: ${text}`);
          }
        }
      }
    }
    expect([...new Set(problems)]).toEqual([]);
  });

  it("fills a template with the topic and tidies the join", () => {
    expect(fillTemplate("en", "{topic} is already here.", { terms: [] }, "what's going on for you")).toBe(
      "What's going on for you is already here."
    );
  });
});
