import { appData } from "./appData";
import type { TermsText } from "../types";

const merge = (a?: Record<string, string>, b?: Record<string, string>) => ({ ...(a ?? {}), ...(b ?? {}) });

/** Term text for `lang`; any entry the language does not have falls back to English. */
export function termsText(lang: string): Required<TermsText> {
  const en = appData.languages.en.terms;
  const own = appData.languages[lang]?.terms;
  return {
    names: merge(en?.names, own?.names),
    short: merge(en?.short, own?.short),
    varies: merge(en?.varies, own?.varies),
  };
}
