import raw from "../data/appData.generated.json";
import type { AppData } from "../types";

export const appData = raw as unknown as AppData;

export function detectLang(saved: string | null): string {
  if (saved && appData.langs.indexOf(saved) > -1) return saved;
  const nav = ((navigator.language || "en") + "").toLowerCase().slice(0, 2);
  return appData.langs.indexOf(nav) > -1 ? nav : "en";
}
