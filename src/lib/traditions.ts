import { appData } from "./appData";
import { L } from "./i18n";
import type { TraditionText } from "../types";

/** Tag and key terms for the tradition at `idx`, in `lang` when available, otherwise English. */
export function traditionText(lang: string, idx: number): TraditionText {
  return L(lang).traditions?.[idx] ?? appData.languages.en.traditions?.[idx] ?? { tag: "", terms: [] };
}
