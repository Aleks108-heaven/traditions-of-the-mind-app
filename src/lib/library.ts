import { appData } from "./appData";
import type { LibraryText } from "../types";

const merge = (a?: Record<string, string>, b?: Record<string, string>) => ({ ...(a ?? {}), ...(b ?? {}) });

/** Library text for `lang`; any entry the language does not have falls back to English. */
export function libraryText(lang: string): Required<LibraryText> {
  const en = appData.languages.en.library;
  const own = appData.languages[lang]?.library;
  return {
    ideas: merge(en?.ideas, own?.ideas),
    notes: merge(en?.notes, own?.notes),
    terms: merge(en?.terms, own?.terms),
    glossary: merge(en?.glossary, own?.glossary),
  };
}
