import raw from "../data/appData.generated.json";
import type { AppData } from "../types";

export const appData = raw as unknown as AppData;

export const LANG_NAMES_EN: Record<string, string> = {
  en: "English",
  uk: "Ukrainian",
  es: "Spanish",
  pl: "Polish",
};

export function detectLang(saved: string | null): string {
  if (saved && appData.langs.indexOf(saved) > -1) return saved;
  const nav = ((navigator.language || "en") + "").toLowerCase().slice(0, 2);
  return appData.langs.indexOf(nav) > -1 ? nav : "en";
}
